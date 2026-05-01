#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import http from 'http';
import url from 'url';
import { authCommand } from '../commands/auth.js';
import { feedCommand } from '../commands/feed.js';
import { searchCommand } from '../commands/search.js';
import { postCommand } from '../commands/post.js';
import { printHeader } from '../utils/ui.js';

// Import auth actions directly for top-level shortcuts
import ora from 'ora';
import open from 'open';
import { api, config } from '../services/api.js';

const program = new Command();

program.configureHelp({
    helpWidth: 100,
    sortSubcommands: true,
    sortOptions: true,
});

program
    .name('oqens')
    .usage('[command] [options]')
    .description('CLI to interact with the OQENS Live Community')
    .version('3.1.0')
    .addHelpText('beforeAll', () => {
        printHeader();
        return '';
    })
    .addHelpText('after', `
${chalk.cyan.bold('Examples:')}
  $ oqens login                   ${chalk.gray('# Authenticate via browser')}
  $ oqens feed --table            ${chalk.gray('# View live feed in a grid')}
  $ oqens search posts "react"    ${chalk.gray('# Find posts about react')}
  $ oqens post view 12345         ${chalk.gray('# Read a post and its comments')}
  $ oqens post comment 12345      ${chalk.gray('# Reply to a post')}

${chalk.magenta('Need more help?')} Run \`oqens [command] --help\` for details on specific commands.
    `);

// --- Top-level shortcut commands ---

program
    .command('login')
    .description('Log in to your OQENS account securely via the browser')
    .action(async () => {
        printHeader();
        
        const PORT = 3456;
        const spinner = ora('Waiting for authentication in browser...').start();

        // Create local server to receive the token
        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            
            if (parsedUrl.pathname === '/callback' && parsedUrl.query.token) {
                const token = parsedUrl.query.token;
                
                // Send success response to browser
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fafafa; color: #111;">
                            <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                <h1 style="color: #10b981; margin-bottom: 10px;">Login Successful!</h1>
                                <p>You have successfully authenticated the OQENS CLI.</p>
                                <p style="color: #666; font-size: 14px;">Redirecting you back in a moment...</p>
                            </div>
                            <script>
                                setTimeout(() => {
                                    window.location.href = 'https://cli.oqens.me';
                                }, 2500);
                            </script>
                        </body>
                    </html>
                `);
                
                // Verify and save token
                spinner.text = 'Verifying token...';
                try {
                    config.set('token', token);
                    await api.post('/rpc/query', {
                        table: 'profiles',
                        action: 'select',
                        limit: 1
                    });
                    spinner.succeed(chalk.green('Successfully authenticated! You can now use the CLI.'));
                } catch (error) {
                    config.delete('token');
                    spinner.fail(chalk.red('Authentication failed. The token might be invalid.'));
                }

                // Shutdown server
                server.close();
                process.exit(0);
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid request.');
            }
        });

        server.listen(PORT, async () => {
            const loginUrl = `https://cli.oqens.me/login?returnTo=${encodeURIComponent(`http://localhost:${PORT}/callback`)}`;
            await open(loginUrl);
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                spinner.fail(chalk.red(`Port ${PORT} is already in use. Please free up the port and try again.`));
                process.exit(1);
            }
        });
    });

program
    .command('logout')
    .description('Log out of OQENS')
    .action(() => {
        config.delete('token');
        console.log(chalk.green('Successfully logged out.'));
    });

// Register subcommands
program.addCommand(authCommand);
program.addCommand(feedCommand);
program.addCommand(searchCommand);
program.addCommand(postCommand);

// If no arguments provided, show help by default
if (process.argv.length === 2) {
    program.help();
}

program.parse(process.argv);

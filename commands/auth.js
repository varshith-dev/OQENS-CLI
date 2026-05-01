import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import http from 'http';
import url from 'url';
import { api, config } from '../services/api.js';

export const authCommand = new Command('auth')
    .description('Authentication commands');

authCommand
    .command('login')
    .description('Log in to your OQENS account securely via the browser')
    .action(async () => {
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
                        <body style="font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fafafa; color: #111; margin: 0;">
                            <div style="text-align: center; background: white; padding: 48px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                                <h1 style="color: #0891b2; margin-bottom: 8px; font-size: 24px;">Authenticated!</h1>
                                <p style="color: #555; font-size: 15px; line-height: 1.6;">You can close this tab and return to your terminal. The CLI is ready to use.</p>
                                <p style="color: #999; font-size: 12px; margin-top: 16px;">This window will close automatically...</p>
                            </div>
                            <script>
                                setTimeout(() => { window.close(); }, 1500);
                                setTimeout(() => { window.location.href = 'https://cli.oqens.me'; }, 3000);
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

authCommand
    .command('logout')
    .description('Log out of OQENS')
    .action(() => {
        config.delete('token');
        console.log(chalk.green('Successfully logged out.'));
    });

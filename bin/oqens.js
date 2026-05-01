#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { authCommand } from '../commands/auth.js';
import { feedCommand } from '../commands/feed.js';
import { searchCommand } from '../commands/search.js';
import { postCommand } from '../commands/post.js';
import { printHeader } from '../utils/ui.js';

const program = new Command();

// Customizing the global help menu to include the OQENS Logo
program.configureHelp({
    helpWidth: 100,
    sortSubcommands: true,
    sortOptions: true,
});

program
    .name('oqens')
    .usage('[command] [options]')
    .description('Enterprise CLI to interact with the OQENS Live Community')
    .version('3.1.0')
    .addHelpText('beforeAll', () => {
        // Print the logo before showing help
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

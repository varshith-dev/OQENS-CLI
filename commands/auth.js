import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { api, config } from '../services/api.js';
import { printHeader } from '../utils/ui.js';

export const authCommand = new Command('auth').description('Authentication commands');

authCommand
    .command('login')
    .description('Log in to your OQENS account via the browser')
    .action(async () => {
        printHeader();
        console.log(chalk.yellow('Opening https://oqens.me in your browser...'));
        console.log(chalk.cyan('1. Log in to your account.'));
        console.log(chalk.cyan('2. Open Developer Tools (F12) -> Application -> Local Storage.'));
        console.log(chalk.cyan('3. Copy the "access_token" from "The Oqens-auth".\n'));
        
        await open('https://oqens.me/login');

        const answers = await inquirer.prompt([
            { type: 'password', name: 'token', message: 'Paste your session token:' }
        ]);

        const spinner = ora('Verifying token...').start();
        try {
            config.set('token', answers.token);
            await api.post('/rpc/query', {
                table: 'profiles',
                action: 'select',
                limit: 1
            });
            spinner.succeed(chalk.green('Successfully authenticated! Token saved securely.'));
        } catch (error) {
            config.delete('token');
            spinner.fail(chalk.red('Invalid token. Please make sure you copied the correct access_token.'));
        }
    });

authCommand
    .command('logout')
    .description('Log out of OQENS')
    .action(() => {
        config.delete('token');
        console.log(chalk.green('Successfully logged out.'));
    });

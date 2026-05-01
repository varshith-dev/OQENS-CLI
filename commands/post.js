import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { api, config } from '../services/api.js';
import { printHeader, formatPost } from '../utils/ui.js';

export const postCommand = new Command('post').description('Interact with posts (create, view, comment, like)');

const ensureAuth = () => {
    const token = config.get('token');
    if (!token) {
        console.log(chalk.yellow('You must be logged in to do this. Run `oqens auth login` first.'));
        process.exit(1);
    }
    return token;
};

postCommand
    .command('create')
    .description('Create a new post')
    .action(async () => {
        ensureAuth();
        printHeader();
        const answers = await inquirer.prompt([
            { type: 'list', name: 'type', message: 'What type of post?', choices: ['meme', 'code'] },
            { type: 'input', name: 'title', message: 'Enter post title/content:', validate: i => i.length > 0 },
            { type: 'editor', name: 'code_snippet', message: 'Enter code snippet:', when: a => a.type === 'code' }
        ]);

        const spinner = ora('Publishing...').start();
        try {
            await api.post('/rpc/query', {
                table: 'posts',
                action: 'insert',
                data: { title: answers.title, type: answers.type, status: 'published', visibility: 'public', code_snippet: answers.code_snippet || null }
            });
            spinner.succeed(chalk.green('Post successfully published!'));
        } catch (error) {
            spinner.fail(chalk.red('Failed to publish: ' + error.message));
        }
    });

postCommand
    .command('view <id>')
    .description('View a specific post and its comments')
    .action(async (id) => {
        printHeader();
        const spinner = ora('Loading post...').start();
        try {
            const res = await api.post('/rpc/query', {
                table: 'posts',
                action: 'select',
                select: '*,profile:profiles!posts_user_id_fkey(id, username, display_name),comments(*,profile:profiles!comments_user_id_fkey(username))',
                filters: [{ type: 'eq', col: 'id', val: id }],
                single: true
            });
            spinner.stop();
            
            if (!res.data.data) {
                console.log(chalk.yellow('Post not found.'));
                return;
            }
            formatPost(res.data.data);
            
            console.log(chalk.cyan.bold('--- Comments ---'));
            const comments = res.data.data.comments || [];
            if (comments.length === 0) {
                console.log(chalk.gray('No comments yet.'));
            } else {
                comments.forEach(c => {
                    console.log(chalk.white.bold(`@${c.profile?.username || 'Unknown'}: `) + chalk.white(c.content));
                });
            }
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('Failed to load post: ' + error.message));
        }
    });

postCommand
    .command('comment <id>')
    .description('Add a comment to a post')
    .action(async (id) => {
        ensureAuth();
        const answers = await inquirer.prompt([{ type: 'input', name: 'content', message: 'Enter your comment:' }]);
        const spinner = ora('Posting comment...').start();
        try {
            await api.post('/rpc/query', {
                table: 'comments',
                action: 'insert',
                data: { post_id: id, content: answers.content }
            });
            spinner.succeed(chalk.green('Comment added!'));
        } catch (error) {
            spinner.fail(chalk.red('Failed to comment: ' + error.message));
        }
    });

postCommand
    .command('like <id>')
    .description('Like a post')
    .action(async (id) => {
        ensureAuth();
        const spinner = ora('Liking post...').start();
        try {
            await api.post('/rpc/query', {
                table: 'likes',
                action: 'insert',
                data: { post_id: id }
            });
            spinner.succeed(chalk.green('Post liked!'));
        } catch (error) {
            spinner.fail(chalk.red('Failed to like (you may have already liked it): ' + error.message));
        }
    });

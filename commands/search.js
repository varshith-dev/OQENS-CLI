import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { api } from '../services/api.js';
import { printHeader, formatPost, createTable } from '../utils/ui.js';

export const searchCommand = new Command('search').description('Search OQENS for posts or users');

searchCommand
    .command('posts <query>')
    .description('Search posts by title')
    .option('-t, --table', 'Output as a table')
    .action(async (query, options) => {
        printHeader();
        const spinner = ora(`Searching posts for "${query}"...`).start();
        try {
            const payload = {
                table: 'posts',
                action: 'select',
                select: '*,profile:profiles!posts_user_id_fkey(id, username, display_name)',
                filters: [
                    { type: 'eq', col: 'status', val: 'published' },
                    { type: 'ilike', col: 'title', val: `%${query}%` }
                ],
                limit: 20
            };

            const res = await api.post('/rpc/query', payload);
            spinner.stop();
            
            const posts = res.data.data;
            if (!posts || posts.length === 0) {
                console.log(chalk.yellow(`No posts found matching "${query}".`));
                return;
            }

            if (options.table) {
                const table = createTable(['ID', 'Author', 'Title', 'Type']);
                posts.forEach(p => table.push([p.id.split('-')[0] + '...', p.profile?.username || 'Unknown', p.title, p.type]));
                console.log(table.toString());
            } else {
                posts.forEach(formatPost);
            }
        } catch (error) {
            spinner.fail(chalk.red('Search failed: ' + (error.response?.data?.error?.message || error.message)));
        }
    });

searchCommand
    .command('users <query>')
    .description('Search users by username')
    .action(async (query) => {
        printHeader();
        const spinner = ora(`Searching users for "${query}"...`).start();
        try {
            const payload = {
                table: 'profiles',
                action: 'select',
                filters: [
                    { type: 'ilike', col: 'username', val: `%${query}%` }
                ],
                limit: 10
            };

            const res = await api.post('/rpc/query', payload);
            spinner.stop();
            
            const users = res.data.data;
            if (!users || users.length === 0) {
                console.log(chalk.yellow(`No users found matching "${query}".`));
                return;
            }

            const table = createTable(['Username', 'Display Name', 'Bio', 'Followers']);
            users.forEach(u => table.push([u.username, u.display_name || '', (u.bio || '').substring(0, 30), u.follower_count || 0]));
            console.log(table.toString());
        } catch (error) {
            spinner.fail(chalk.red('Search failed: ' + (error.response?.data?.error?.message || error.message)));
        }
    });

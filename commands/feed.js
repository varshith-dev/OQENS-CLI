import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { api } from '../services/api.js';
import { printHeader, formatPost, createTable } from '../utils/ui.js';

export const feedCommand = new Command('feed').description('View the latest posts on the live OQENS community');

feedCommand
    .option('-t, --table', 'Output as a table')
    .option('-l, --limit <number>', 'Number of posts to fetch', '10')
    .action(async (options) => {
        printHeader();
        const spinner = ora('Fetching live feed...').start();
        try {
            const payload = {
                table: 'posts',
                action: 'select',
                select: '*,profile:profiles!posts_user_id_fkey(id, username, display_name),likes(count),comments(count)',
                filters: [{ type: 'eq', col: 'status', val: 'published' }],
                order: { col: 'created_at', ascending: false },
                limit: parseInt(options.limit, 10)
            };

            const res = await api.post('/rpc/query', payload);
            spinner.stop();
            
            const posts = res.data.data;
            if (!posts || posts.length === 0) {
                console.log(chalk.yellow('No posts found in the feed.'));
                return;
            }

            if (options.table) {
                const table = createTable(['ID', 'Author', 'Type', 'Likes', 'Comments']);
                posts.forEach(p => {
                    table.push([
                        p.id.split('-')[0] + '...', 
                        p.profile?.username || 'Unknown', 
                        p.type, 
                        p.likes?.[0]?.count || 0, 
                        p.comments?.[0]?.count || 0
                    ]);
                });
                console.log(table.toString());
            } else {
                posts.forEach(formatPost);
            }
        } catch (error) {
            spinner.fail(chalk.red('Failed to fetch feed: ' + (error.response?.data?.error?.message || error.message)));
        }
    });

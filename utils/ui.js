import chalk from 'chalk';
import figlet from 'figlet';
import Table from 'cli-table3';

export const printHeader = () => {
    const logoText = figlet.textSync('OQENS CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 100,
        whitespaceBreak: true
    });
    console.log(chalk.red(logoText));
    console.log(chalk.gray('The official enterprise CLI for OQENS.'));
    console.log('');
};

export const createTable = (head) => {
    return new Table({
        head: head.map(h => chalk.cyan.bold(h)),
        style: {
            head: [],
            border: ['gray']
        }
    });
};

export const formatPost = (post) => {
    const author = post.profile?.display_name || post.profile?.username || 'Unknown';
    const typeColor = post.type === 'code' ? chalk.cyan : chalk.magenta;
    console.log(chalk.bold.white(`@${author}`) + ` • ${typeColor(post.type.toUpperCase())} • ID: ${chalk.yellow(post.id)}`);
    console.log(chalk.gray(new Date(post.created_at).toLocaleString()));
    console.log('\n' + chalk.white(post.title));
    if (post.code_snippet) {
        console.log(chalk.gray('----------------------------------------'));
        console.log(chalk.green(post.code_snippet));
        console.log(chalk.gray('----------------------------------------'));
    }
    console.log(chalk.gray(`❤️  Likes: ${post.likes?.[0]?.count || 0}   💬 Comments: ${post.comments?.[0]?.count || 0}`));
    console.log(chalk.gray('========================================\n'));
};

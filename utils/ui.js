import chalk from 'chalk';
import Table from 'cli-table3';

// Hand-crafted, original OQENS logo — clean Linux-style block art
const LOGO = `
   ┌──────────────────────────────────────────────────────┐
   │                                                      │
   │    ██████   ██████  ███████ ███    ██ ███████         │
   │   ██    ██ ██    ██ ██      ████   ██ ██              │
   │   ██    ██ ██    ██ █████   ██ ██  ██ ███████         │
   │   ██    ██ ██ ▄▄ ██ ██      ██  ██ ██      ██         │
   │    ██████   ██████  ███████ ██   ████ ███████         │
   │                ▀▀                                     │
   │                                           CLI v3.1.0  │
   └──────────────────────────────────────────────────────┘`;

export const printHeader = () => {
    console.log(chalk.white.bold(LOGO));
    console.log(chalk.gray('  The official enterprise CLI for OQENS.\n'));
};

export const createTable = (head) => {
    return new Table({
        head: head.map(h => chalk.cyan.bold(h)),
        style: {
            head: [],
            border: ['gray']
        },
        chars: {
            'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
            'right': '│', 'right-mid': '┤', 'middle': '│'
        }
    });
};

export const formatPost = (post) => {
    const author = post.profile?.display_name || post.profile?.username || 'Unknown';
    const typeColor = post.type === 'code' ? chalk.cyan : chalk.magenta;
    console.log(chalk.bold.white(`  @${author}`) + ` · ${typeColor(post.type.toUpperCase())} · ID: ${chalk.yellow(post.id)}`);
    console.log(chalk.gray(`  ${new Date(post.created_at).toLocaleString()}`));
    console.log('\n  ' + chalk.white(post.title));
    if (post.code_snippet) {
        console.log(chalk.gray('  ────────────────────────────────────'));
        console.log(chalk.green('  ' + post.code_snippet.split('\n').join('\n  ')));
        console.log(chalk.gray('  ────────────────────────────────────'));
    }
    console.log(chalk.gray(`  ❤  Likes: ${post.likes?.[0]?.count || 0}   💬 Comments: ${post.comments?.[0]?.count || 0}`));
    console.log(chalk.gray('  ════════════════════════════════════\n'));
};

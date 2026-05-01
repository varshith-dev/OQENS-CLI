import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';

export const printHeader = () => {
    // Elegant, minimalist boxed logo using boxen
    const asciiArt = `
  ██████╗  ██████╗ ███████╗███╗   ██╗███████╗     ██████╗██╗     ██╗
  ██╔═══██╗██╔═══██╗██╔════╝████╗  ██║██╔════╝    ██╔════╝██║     ██║
  ██║   ██║██║   ██║█████╗  ██╔██╗ ██║███████╗    ██║     ██║     ██║
  ██║   ██║██║▄▄ ██║██╔══╝  ██║╚██╗██║╚════██║    ██║     ██║     ██║
  ╚██████╔╝╚██████╔╝███████╗██║ ╚████║███████║    ╚██████╗███████╗██║
   ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝     ╚═════╝╚══════╝╚═╝`;

    const logoText = chalk.bold.white(asciiArt) + chalk.gray('\n\n                                  Version 3.1.0');
    
    console.log(boxen(logoText, {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: 'cyan',
        align: 'center'
    }));
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
    console.log(chalk.bold.white(`  @${author}`) + ` · ${typeColor(post.type.toUpperCase())} · ID: ${chalk.yellow(post.id)}`);
    console.log(chalk.gray(`  ${new Date(post.created_at).toLocaleString()}`));
    console.log('\n  ' + chalk.white(post.title));
    if (post.code_snippet) {
        console.log(chalk.gray('  ----------------------------------------'));
        console.log(chalk.green('  ' + post.code_snippet.split('\n').join('\n  ')));
        console.log(chalk.gray('  ----------------------------------------'));
    }
    console.log(chalk.gray(`  Likes: ${post.likes?.[0]?.count || 0}   Comments: ${post.comments?.[0]?.count || 0}`));
    console.log(chalk.gray('  ========================================\n'));
};

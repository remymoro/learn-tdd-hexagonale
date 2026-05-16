import { Command } from 'commander';
import { PublishTweetUseCase } from '@application/tweet/publish/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@application/tweet/timeline/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@application/tweet/update/UpdateTweetUseCase';
import { FileSystemTweetRepository } from '@infrastructure/FileSystemTweetRepository';
import { TweetCliPresenter } from './presenters/TweetCliPresenter';

const tweetRepository = new FileSystemTweetRepository();
const publishTweetUseCase = new PublishTweetUseCase(tweetRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(tweetRepository);
const updateTweetUseCase = new UpdateTweetUseCase(tweetRepository);

const program = new Command();

program
  .name('twitter-cli')
  .description('Une CLI pour notre application de Tweets (Architecture Hexagonale)')
  .version('1.0.0');

program.command('post')
  .description('Publier un nouveau tweet')
  .argument('<message>', 'Le contenu du tweet (max 280 caractères)')
  .requiredOption('-a, --author <authorId>', "L'identifiant de l'auteur du tweet")
  .action(async (message, options) => {
    try {
      const tweet = await publishTweetUseCase.execute({ message, authorId: options.author });
      console.log(TweetCliPresenter.formatCreated(tweet));
    } catch (error: any) {
      console.error(TweetCliPresenter.formatError(`Erreur lors de la publication : ${error.message}`));
      process.exit(1);
    }
  });

program.command('timeline')
  .description("Afficher la timeline (tous les tweets ou ceux d'un auteur spécifique)")
  .option('-a, --author <authorId>', 'Filtrer par auteur')
  .action(async (options) => {
    try {
      const tweets = await viewTimelineUseCase.execute({ authorId: options.author });
      console.log('--- Timeline ---');
      console.log(TweetCliPresenter.formatList(tweets));
      console.log('----------------');
    } catch (error: any) {
      console.error(TweetCliPresenter.formatError(`Erreur lors de la récupération : ${error.message}`));
      process.exit(1);
    }
  });

program.command('update')
  .description('Mettre à jour un tweet existant')
  .argument('<id>', 'L\'identifiant du tweet à mettre à jour')
  .argument('<message>', 'Le nouveau message du tweet (max 280 caractères)')
  .requiredOption('-a, --author <authorId>', "L'identifiant de l'auteur du tweet")
  .action(async (id, message, options) => {
    try {
      await updateTweetUseCase.execute({ id, message, authorId: options.author });
      console.log(TweetCliPresenter.formatUpdated());
    } catch (error: any) {
      console.error(TweetCliPresenter.formatError(`Erreur lors de la mise à jour : ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

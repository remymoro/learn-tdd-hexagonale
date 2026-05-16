import { Command } from 'commander';
import { FileSystemTweetRepository } from './infrastructure/FileSystemTweetRepository';
import { PublishTweetUseCase } from '@application/tweet/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@application/tweet/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@application/tweet/UpdateTweetUseCase';

// Initialisation des dépendances (Injection de dépendance manuelle)
// Dans une vraie application, on utiliserait un conteneur (IoC) ou un fichier de composition.
const tweetRepository = new FileSystemTweetRepository();
const publishTweetUseCase = new PublishTweetUseCase(tweetRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(tweetRepository);
const updateTweetUseCase = new UpdateTweetUseCase(tweetRepository);

const program = new Command();

program
  .name('twitter-cli')
  .description('Une CLI pour notre application de Tweets (Architecture Hexagonale)')
  .version('1.0.0');

// Définition de la commande "post"
program.command('post')
  .description('Publier un nouveau tweet')
  .argument('<message>', 'Le contenu du tweet (max 280 caractères)')
  .requiredOption('-a, --author <authorId>', 'L\'identifiant de l\'auteur du tweet')
  .action(async (message, options) => {
    try {
      // 1. On appelle le Use Case (Port d'entrée)
      await publishTweetUseCase.execute({
        message,
        authorId: options.author
      });

      console.log('✅ Tweet publié avec succès !');
      console.log('\n--- État actuel de la base de données (Fichier JS) ---');
      const allTweets = await tweetRepository.getAllTweets();
      console.dir(allTweets, { depth: null });

    } catch (error: any) {
      // 2. Gestion des erreurs métier levées par le domaine
      console.error('❌ Erreur lors de la publication du tweet :');
      console.error(error.message);
      process.exit(1);
    }
  });

// Définition de la commande "timeline"
program.command('timeline')
  .description('Afficher la timeline (tous les tweets ou ceux d\'un auteur spécifique)')
  .option('-a, --author <authorId>', 'Filtrer par auteur')
  .action(async (options) => {
    try {
      // Appel du Use Case
      const timeline = await viewTimelineUseCase.execute({
        authorId: options.author
      });

      console.log('--- Timeline ---');
      if (timeline.length === 0) {
        console.log('Aucun tweet à afficher.');
      } else {
        timeline.forEach((tweet, index) => {
          console.log(`[${index + 1}] ${tweet.id} @${tweet.authorId}: ${tweet.content}`);
        });
      }
      console.log('----------------');
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération de la timeline :');
      console.error(error.message);
      process.exit(1);
    }
  });


program.command('update')
  .description('Mettre à jour un tweet existant')
  .argument('<id>', 'L\'identifiant du tweet à mettre à jour')
  .argument('<message>', 'Le nouveau message du tweet (max 280 caractères)')
  .requiredOption('-a, --author <authorId>', 'L\'identifiant de l\'auteur du tweet')
  .action(async (id, message, options) => {
    try {
      // 1. On appelle le Use Case (Port d'entrée)
      await updateTweetUseCase.execute({
        id,
        message,
        authorId: options.author
      });

      console.log('✅ Tweet mis à jour avec succès !');
      console.log('\n--- État actuel de la base de données (Fichier JS) ---');
      const allTweets = await tweetRepository.getAllTweets();
      console.dir(allTweets, { depth: null });

    } catch (error: any) {
      // 2. Gestion des erreurs métier levées par le domaine
      console.error('❌ Erreur lors de la mise à jour du tweet :');
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();

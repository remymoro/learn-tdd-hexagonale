import { describe, it } from 'vitest';

// La CLI est une application en ligne de commande, pas un serveur HTTP.
// Les tests e2e de la CLI s'effectuent via l'exécution du process et
// l'inspection de la sortie standard (stdout/stderr).
describe('CliController (e2e)', () => {
  it.todo('implémente les tests e2e CLI via stdout/stderr');
});

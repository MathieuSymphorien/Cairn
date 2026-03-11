Application Desktop pour mes besoins dans ma gestion de projet.

Pour lancer le projet :
pnpm tauri dev

EXPLICATION SUR LES FICHIERS GENERES PAR CLAUDE CODE

## Fichier `image-paste-handler.ts` /

Ce fichier crée une **extension TipTap custom** (un plugin qui ajoute un comportement). Ligne par ligne :

**`readFileAsBase64`** — une fonction utilitaire :
```tsx
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```
Elle prend un fichier (image) et le convertit en texte base64 (une longue chaîne `data:image/png;base64,iVBOR...` qui **représente** l'image). C'est une `Promise` car la lecture de fichier est asynchrone (prend du temps).

**`handlePaste`** — quand tu fais Ctrl+V :
1. Vérifie si le presse-papier contient des fichiers (`clipboardData?.files`)
2. Vérifie si c'est une image (`file.type.startsWith("image/")`)
3. Si oui → convertit en base64 → insère dans l'éditeur avec `setImage`
4. `return true` = "j'ai géré l'événement, TipTap n'a rien d'autre à faire"

**`handleDrop`** — pareil mais pour le drag-and-drop (même logique avec `dataTransfer` au lieu de `clipboardData`).

---

## Fichier `drawing-node.ts`

Ce fichier **définit un nouveau type de bloc** dans TipTap. Par défaut, TipTap connaît : paragraphes, titres, images, listes... Ici on lui apprend un nouveau type : **"drawing"**.

```tsx
export const DrawingNode = Node.create({
  name: "drawing",        // le nom du bloc
  group: "block",         // c'est un bloc (pas du texte inline)
  draggable: true,        // on peut le déplacer dans l'éditeur
  atom: true,             // c'est un bloc "opaque" (pas de texte à l'intérieur)
```

**`addAttributes`** — les données stockées par ce bloc :
- `src` : l'image du dessin sauvegardée en base64
- `width`, `height` : la taille du canvas

**`addNodeView`** :
```tsx
return ReactNodeViewRenderer(DrawingCanvas);
```
Dit à TipTap : "pour afficher ce bloc, utilise le composant React `DrawingCanvas`". C'est le pont entre TipTap et React.

**`addCommands`** → `insertDrawing` — la commande que le bouton crayon de la toolbar appelle pour insérer un nouveau bloc dessin.

Le `declare module` en haut :
```tsx
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    drawing: {
      insertDrawing: () => ReturnType;
    };
  }
}
```
C'est du TypeScript avancé — ça dit "la commande `insertDrawing` existe" pour que l'autocomplétion fonctionne dans `editor.chain().focus().insertDrawing()`.

---

## Fichier `drawing-canvas.tsx`

Le composant React qui **affiche et gère le canvas de dessin**. Le flux complet :

**Quand tu dessines :**
1. **`handlePointerDown`** — tu appuies sur le canvas → `isDrawing = true`, enregistre le premier point `[x, y, pressure]`
2. **`handlePointerMove`** — tu bouges la souris → ajoute des points au tracé, redessine tout
3. **`handlePointerUp`** — tu relâches → sauvegarde le tracé dans `paths`, convertit le canvas en base64 avec `canvas.toDataURL()` et appelle `updateAttributes({ src: ... })` pour sauvegarder dans TipTap

**Les fonctions mathématiques :**
- **`getStroke`** (de `perfect-freehand`) — transforme les points bruts `[x, y, pressure]` en un tracé lisse et joli (simule un vrai stylo)
- **`getSvgPathFromStroke`** — convertit ce tracé en chemin SVG (`M ... Q ... Z`) que le canvas peut dessiner via `Path2D`

**Les hooks React utilisés :**
- `useRef` → accéder directement au `<canvas>` HTML (comme `document.getElementById` mais version React)
- `useState` → stocker l'état (est-ce qu'on dessine ? quels tracés existent ?)
- `useCallback` → empêche de recréer la fonction `redraw` à chaque rendu (optimisation)
- `useEffect` → recharger un dessin existant quand le composant s'affiche

**`NodeViewWrapper`** — un composant TipTap obligatoire qui enveloppe le rendu React d'un node custom. Sans lui, TipTap ne sait pas où placer le composant dans le document.


**Consulte ce fichier aussi souvent que possible lorsque tu commences une tâche, pendant la tâche et à la fin de la tâche, tu dois toujours vérifier ce fichier. Entre temps, je peux te donner des infos et des instructions supplémentaires N'écris rien dans ce fichier. Ce fichier m'appartient. C'est simplement un fichier pour dialoguer avec toi pour des tâches supplémentaires, en te décrivant les étapes avec précision.**
ContextEngineering\Tasks\Cisco.md


Avec mon approbation écrite, tu peux commencer à travailler sur la tâche.

Ensuite nous allons revoir tout le système audio parce que c'est une catastrophe  
Il faut tout revoir depuis le début avec l'audio  
Tout est désynchronisé  
Il y a un widget en bas à droite qui se nomme : Contrôle audio d'ambiance. En fait, lorsqu'on veut agir sur le volume, il n'y a plus rien qui fonctionne. Au contraire, même ça arrête le son. 

Alors ci-dessous, c'est très simple, c'est le répertoire des effets sonores qui sont normalement synchro avec tous les boutons dans le panneau de contrôle d'ambiance : Components\UI\TimeSimulator.tsx
Et en fait c'est tout simple pour réparer pour que les sons soient fonctionnels tu regardes le répertoire dessous et là tu as tout ce qu'il faut pour réparer. Si nous prenons par exemple le sous-dossier, c'est un exemple. Après 12 h, tu visites ce dossier, tu verras il y a normalement un ou deux fichiers sonores. Parfois, il peut peut-être en avoir trois. Eh bien, c'est simple. Quand on clique sur le bouton du contrôle, du panneau de contrôle d'ambiance, ça permet d'activer ces sons. Mais juste ces sons, ça veut dire que si je clique sur le bouton après 12 h, ça enclenche ces sons. Et si je clique maintenant sur le bouton Aube, ça arrête. L'effet sonore après 12 h, et c'est le bouton Aube qui active les fichiers sonores qui sont inclus dedans. Tu comprends ? 
public\sounds
public\sounds\apres-midi
public\sounds\aube
public\sounds\coucher-soleil
public\sounds\crepuscule
public\sounds\lever-soleil
public\sounds\matin
public\sounds\midi
public\sounds\nuit-profonde
























































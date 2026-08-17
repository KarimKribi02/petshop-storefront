export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Nutrition' | 'Santé' | 'Comportement' | 'Éducation' | 'Bien-être' | string;
  image: string;
  date: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  featured?: boolean;
  popular?: boolean;
  tags: string[];
}

export interface BlogCategoryInfo {
  name: string;
  slug: string;
  count: number;
  iconName: 'Apple' | 'HeartPulse' | 'Smile' | 'GraduationCap' | 'Sparkles';
}

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'quelle-alimentation-choisir-pour-votre-chien',
    title: 'Quelle alimentation choisir pour votre chien ?',
    excerpt: 'Découvrez comment choisir la meilleure alimentation adaptée à l’âge, la taille et le niveau d’activité de votre chien pour garantir sa vitalité.',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    date: '12 Mai 2024',
    readingTime: '5 min de lecture',
    author: {
      name: 'Dr. Youssef Alami',
      role: 'Docteur Vétérinaire Nutritionniste',
    },
    featured: true,
    popular: true,
    tags: ['Alimentation', 'Croquettes', 'Santé Chien', 'Nutrition'],
    content: `
### Comprendre les besoins nutritionnels spécifiques de votre chien

L'alimentation est le pilier fondamental de la santé, de la vitalité et de la longévité de votre compagnon à quatre pattes. Un chiot en pleine croissance, un chien adulte très actif ou un sénior n'ont absolument pas les mêmes exigences caloriques et protéiques.

Choisir la bonne nourriture implique de prendre en compte plusieurs facteurs déterminants :
* **L'âge de l'animal** : Les chiots ont besoin d'un apport élevé en protéines nobles, calcium et phosphore pour bâtir leur squelette.
* **La race et le gabarit** : Un petit chien a un métabolisme rapide tandis qu'un grand chien requiert une alimentation hautement digestible.
* **Le niveau d'activité physique** : Un chien de sport dépensera deux fois plus de calories qu'un chien sédentaire.

---

### Les bienfaits de la bi-nutrition (Mix-Feeding)

Associer des croquettes sèches à une alimentation humide de haute qualité (pâtée ou effilés de viande) présente de nombreux avantages :
1. **Hydratation renforcée** : Idéal pour les chiens qui boivent peu.
2. **Appétence maximale** : Parfait pour stimuler les animaux exigeants.
3. **Hygiène dentaire préservée** : La mastication des croquettes favorise le détartrage naturel des dents.
    `,
  },
  {
    id: 2,
    slug: 'pourquoi-mon-chat-fait-il-ses-griffes-partout',
    title: 'Pourquoi mon chat fait-il ses griffes partout ?',
    excerpt: 'Comprendre ce comportement naturel indispensable et comment protéger efficacement vos meubles avec des solutions simples et adaptées.',
    category: 'Comportement',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    date: '10 Mai 2024',
    readingTime: '4 min de lecture',
    author: {
      name: 'Sara Benjelloun',
      role: 'Comportementaliste Félin',
    },
    popular: true,
    tags: ['Comportement Félin', 'Griffures', 'Arbre à chat', 'Bien-être'],
    content: `
### Faire ses griffes : un besoin biologique vital

Beaucoup de propriétaires pensent à tort que les griffades sont un acte de provocation. En réalité, ce comportement répond à des nécessités physiologiques fondamentales :
* **Entretien des griffes** : Débarrasser les pattes des gaines de cornes mortes.
* **Marquage territorial** : Dépôt de phéromones rassurantes.
* **Étirement musculaire** : Détendre la colonne vertébrale après la sieste.

---

### Comment détourner l'attention de vos meubles ?

1. Installez des griffoirs près de son lieu de couchage.
2. Variez les textures (sisal, carton ondulé, bois brut).
3. Utilisez de l'herbe à chat (Cataire) pour stimuler son intérêt.
    `,
  },
  {
    id: 3,
    slug: 'les-vaccins-essentiels-pour-votre-chien',
    title: 'Les vaccins essentiels pour votre chien',
    excerpt: 'Le guide complet des vaccins indispensables pour protéger efficacement votre compagnon contre les maladies virales courantes.',
    category: 'Santé',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    date: '8 Mai 2024',
    readingTime: '6 min de lecture',
    author: {
      name: 'Dr. Mehdi Kawtari',
      role: 'Docteur Vétérinaire Clinicien',
    },
    popular: true,
    tags: ['Santé Animale', 'Vaccination', 'Prévention', 'Chien'],
    content: `
### Pourquoi la vaccination est-elle incontournable ?

La vaccination stimule le système immunitaire de votre chien pour fabriquer des anticorps protecteurs contre des maladies potentiellement mortelles.

### Le protocole vaccinal de base
* **La Maladie de Carré (C)** : Virus très contagieux.
* **La Parvovirose (P)** : Gastro-entérite hémorragique foudroyante.
* **La Leptospirose (L)** : Maladie bactérienne grave transmise par l'eau stagnante.
* **La Rage (R)** : Obligatoire pour les voyages et essentielle pour la protection publique.
    `,
  },
  {
    id: 4,
    slug: 'comment-reduire-le-stress-chez-votre-chat',
    title: 'Comment réduire le stress chez votre chat ?',
    excerpt: 'Nos conseils pratiques et astuces éprouvées pour aider votre félin à se sentir en sécurité et apaiser son anxiété au quotidien.',
    category: 'Bien-être',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    date: '5 Mai 2024',
    readingTime: '4 min de lecture',
    author: {
      name: 'Dr. Salma Mansouri',
      role: 'Vétérinaire Spécialiste Bien-être',
    },
    tags: ['Chat', 'Anti-stress', 'Bien-être', 'Phéromones'],
    content: `
### Identifier les signes de stress chez le chat

Le chat est un animal territorial très sensible aux changements. Un chat stressé peut manifester du léchage compulsif, de la malpropreté ou de l'agressivité.

### 4 solutions éprouvées :
1. Créer des refuges en hauteur (arbres à chat).
2. Utiliser des diffuseurs de phéromones apaisantes.
3. Respecter la règle du nombre de litières.
4. Proposer 15 minutes de jeu actif par jour.
    `,
  },
  {
    id: 5,
    slug: '5-astuces-pour-eduquer-votre-chien-facilement',
    title: '5 astuces pour éduquer votre chien facilement',
    excerpt: 'Des techniques bienveillantes basées sur le renforcement positif pour apprendre les bases de l’obéissance à votre compagnon canin.',
    category: 'Éducation',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    date: '2 Mai 2024',
    readingTime: '7 min de lecture',
    author: {
      name: 'Karim Tazi',
      role: 'Éducateur Canin Certifié',
    },
    tags: ['Éducation', 'Dressage', 'Renforcement Positif', 'Chien'],
    content: `
### 1. Privilégier le renforcement positif
Récompensez les bons comportements avec une friandise ou une caresse chaleureuse.

### 2. Des séances courtes et régulières
5 à 10 minutes par séance, 2 à 3 fois par jour pour maintenir l'attention maximale.

### 3. Cohérence des ordres
Toute la famille doit utiliser les mêmes mots-clés et règles claires.
    `,
  },
  {
    id: 6,
    slug: 'croquettes-ou-patee-que-choisir',
    title: 'Croquettes ou pâtée : que choisir pour son animal ?',
    excerpt: 'Avantages, inconvénients et comparatif nutritionnel complet pour vous aider à faire le meilleur choix au quotidien.',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    date: '30 Avr 2024',
    readingTime: '5 min de lecture',
    author: {
      name: 'Dr. Youssef Alami',
      role: 'Docteur Vétérinaire Nutritionniste',
    },
    popular: true,
    tags: ['Nutrition', 'Croquettes', 'Pâtée', 'Alimentation'],
    content: `
### Croquettes (Alimentation sèche)
* Praticité et excellente conservation.
* Effet abrasif naturel sur les dents limitant le tartre.

### Pâtée (Alimentation humide)
* Forte teneur en eau (75-85%) préservant la fonction rénale.
* Saveur très appétente et satiété rapide.

> La combinaison des deux (croquettes le matin, pâtée le soir) offre l'équilibre nutritionnel parfait !
    `,
  },
];

export const BLOG_POSTS: BlogPost[] = FALLBACK_BLOG_POSTS;

export function formatApiPost(raw: any): BlogPost {
  let tagsList: string[] = [];
  if (Array.isArray(raw.tags)) {
    tagsList = raw.tags;
  } else if (typeof raw.tags === 'string' && raw.tags.trim()) {
    tagsList = raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  const rawCat = raw.category_name || raw.category || 'Nutrition';
  const cleanCat = (rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase()).trim();

  // Word count & reading time
  const wordCount = (raw.content || '').split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 180));
  const readingTime = `${minutes} min de lecture`;

  const dateFormatted = raw.published_at || raw.created_at
    ? new Date(raw.published_at || raw.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '12 Mai 2024';

  let authorRole = 'Expert Animalier';
  const authorName = raw.author_name || 'Dr. Vétérinaire';
  if (authorName.toLowerCase().includes('youssef') || authorName.toLowerCase().includes('mehdi') || authorName.toLowerCase().includes('dr')) {
    authorRole = 'Docteur Vétérinaire Clinicien';
  } else if (authorName.toLowerCase().includes('sara') || authorName.toLowerCase().includes('salma')) {
    authorRole = 'Comportementaliste Félin';
  } else if (authorName.toLowerCase().includes('karim')) {
    authorRole = 'Éducateur Canin Certifié';
  }

  return {
    id: raw.id,
    slug: raw.slug || `article-${raw.id}`,
    title: raw.title,
    excerpt: raw.excerpt || (raw.content ? raw.content.substring(0, 160) + '...' : ''),
    content: raw.content || '',
    category: cleanCat,
    image: raw.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    date: dateFormatted,
    readingTime: readingTime,
    author: {
      name: authorName,
      role: authorRole,
    },
    popular: true,
    tags: tagsList,
  };
}

export function buildCategoriesList(posts: BlogPost[]): BlogCategoryInfo[] {
  const catsMap: { [key: string]: number } = {};

  posts.forEach((p) => {
    const c = p.category || 'Général';
    catsMap[c] = (catsMap[c] || 0) + 1;
  });

  const list: BlogCategoryInfo[] = [
    {
      name: 'Toutes les catégories',
      slug: 'all',
      count: posts.length,
      iconName: 'Sparkles',
    },
  ];

  const fixedIcons: { [key: string]: 'Apple' | 'HeartPulse' | 'Smile' | 'GraduationCap' | 'Sparkles' } = {
    nutrition: 'Apple',
    santé: 'HeartPulse',
    sante: 'HeartPulse',
    comportement: 'Smile',
    éducation: 'GraduationCap',
    education: 'GraduationCap',
    'bien-être': 'Sparkles',
    'bien-etre': 'Sparkles',
  };

  Object.entries(catsMap).forEach(([catName, count]) => {
    const lower = catName.toLowerCase();
    list.push({
      name: catName,
      slug: lower.replace(/\s+/g, '-'),
      count: count,
      iconName: fixedIcons[lower] || 'Sparkles',
    });
  });

  return list;
}

export const BLOG_CATEGORIES: BlogCategoryInfo[] = buildCategoriesList(FALLBACK_BLOG_POSTS);

export function getAllBlogPosts(): BlogPost[] {
  return FALLBACK_BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return FALLBACK_BLOG_POSTS.find((p) => p.slug === slug || p.slug === decodeURIComponent(slug));
}

export function getRelatedBlogPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  const others = FALLBACK_BLOG_POSTS.filter((p) => p.slug !== currentSlug);
  const sameCat = others.filter((p) => p.category === category);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  const remaining = others.filter((p) => p.category !== category);
  return [...sameCat, ...remaining].slice(0, limit);
}

export function getPopularBlogPosts(limit = 4): BlogPost[] {
  const popular = FALLBACK_BLOG_POSTS.filter((p) => p.popular);
  if (popular.length >= limit) return popular.slice(0, limit);
  return FALLBACK_BLOG_POSTS.slice(0, limit);
}

import { useEffect } from 'react';

/**
 * Hook pour gérer les meta tags SEO dynamiquement
 * @param {Object} seo - Objet contenant title, description, keywords, image, url
 */
export const useSEO = ({ 
  title, 
  description, 
  keywords = '', 
  image = '/pikachu.png',
  url = window.location.href 
}) => {
  useEffect(() => {
    // Mise à jour du titre
    if (title) {
      document.title = `${title} | PokéQuest`;
    }

    // Fonction helper pour mettre à jour ou créer une meta tag
    const updateMetaTag = (property, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Meta tags standards
    if (description) {
      updateMetaTag('description', description);
    }
    
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title || 'PokéQuest', true);
    updateMetaTag('og:description', description || 'Plateforme de défis Pokémon', true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image, true);

    // Twitter Card tags
    updateMetaTag('twitter:title', title || 'PokéQuest');
    updateMetaTag('twitter:description', description || 'Plateforme de défis Pokémon');
    updateMetaTag('twitter:image', image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }
  }, [title, description, keywords, image, url]);
};

/**
 * Composant SEO pour définir les meta tags
 */
export const SEO = ({ title, description, keywords, image, url }) => {
  useSEO({ title, description, keywords, image, url });
  return null;
};

export default SEO;

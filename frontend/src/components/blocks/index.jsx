// Block Components Library
// These are wrapper components for the page builder

import HeroBlock from './HeroBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import ButtonBlock from './ButtonBlock';
import CardBlock from './CardBlock';
import ContainerBlock from './ContainerBlock';
import SpacerBlock from './SpacerBlock';
import HeadingBlock from './HeadingBlock';
import AlertBlock from './AlertBlock';
import BadgeBlock from './BadgeBlock';

// Block Registry - Maps block types to components
export const BLOCK_REGISTRY = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  card: CardBlock,
  container: ContainerBlock,
  spacer: SpacerBlock,
  heading: HeadingBlock,
  alert: AlertBlock,
  badge: BadgeBlock,
};

// Block Definitions - For the block picker UI
export const BLOCK_DEFINITIONS = [
  {
    type: 'heading',
    name: 'Heading',
    icon: '📝',
    category: 'Content',
    description: 'Add a heading (H1-H6)',
    defaultProps: {
      text: 'Your Heading Here',
      level: 2,
      align: 'left',
    },
  },
  {
    type: 'text',
    name: 'Text / Paragraph',
    icon: '📄',
    category: 'Content',
    description: 'Add rich text content',
    defaultProps: {
      content: '<p>Your text content here...</p>',
    },
  },
  {
    type: 'image',
    name: 'Image',
    icon: '🖼️',
    category: 'Media',
    description: 'Add an image',
    defaultProps: {
      src: '',
      alt: 'Image',
      caption: '',
    },
  },
  {
    type: 'button',
    name: 'Button',
    icon: '🔘',
    category: 'Interactive',
    description: 'Add a call-to-action button',
    defaultProps: {
      text: 'Click Me',
      variant: 'primary',
      size: 'md',
      href: '#',
    },
  },
  {
    type: 'card',
    name: 'Card',
    icon: '🃏',
    category: 'Layout',
    description: 'Add a card container',
    defaultProps: {
      variant: 'default',
      padding: 'md',
      shadow: 'md',
    },
  },
  {
    type: 'container',
    name: 'Container',
    icon: '📦',
    category: 'Layout',
    description: 'Add a responsive container',
    defaultProps: {
      size: 'default',
      padding: true,
    },
  },
  {
    type: 'hero',
    name: 'Hero Section',
    icon: '🎭',
    category: 'Sections',
    description: 'Add a hero banner',
    defaultProps: {
      title: 'Welcome',
      subtitle: 'Subtitle text',
      backgroundImage: '',
      height: 'md',
    },
  },
  {
    type: 'spacer',
    name: 'Spacer',
    icon: '↕️',
    category: 'Layout',
    description: 'Add vertical spacing',
    defaultProps: {
      height: 'md',
    },
  },
  {
    type: 'alert',
    name: 'Alert',
    icon: '⚠️',
    category: 'Content',
    description: 'Add an alert message',
    defaultProps: {
      type: 'info',
      title: 'Info',
      message: 'This is an alert message',
    },
  },
  {
    type: 'badge',
    name: 'Badge',
    icon: '🏷️',
    category: 'Content',
    description: 'Add a badge/label',
    defaultProps: {
      text: 'Badge',
      variant: 'primary',
      size: 'md',
    },
  },
];

export default BLOCK_REGISTRY;

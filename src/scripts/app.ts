import { Scroll } from '@/scripts/scroll';
import { Transitions } from '@/scripts/page-transition';

const transitions = new Transitions();
transitions.init();

Scroll.init();

if (import.meta.env.MODE === 'development') {
    import('@locomotivemtl/grid-helper')
        .then(({ default: GridHelper }) => {
            new GridHelper({
                columns: 'var(--grid-columns)',
                gutterWidth: `var(--spacing-grid-gutter)`,
                marginWidth: `var(--spacing-grid-margin)`
            });
        })
        .catch((error) => {
            console.error('Failed to load the grid helper:', error);
        });
}

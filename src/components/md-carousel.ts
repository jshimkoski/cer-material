import { component, html, css, useProps, useStyle } from '@jasonshimmy/custom-elements-runtime';
import { each, when } from '@jasonshimmy/custom-elements-runtime/directives';

interface CarouselItem {
  id: string;
  headline?: string;
  supportingText?: string;
  image?: string;
  color?: string;
}

component('md-carousel', () => {
  const props = useProps({
    items: [] as CarouselItem[],
    variant: 'multi-browse' as 'multi-browse' | 'uncontained' | 'full-screen',
  });

  useStyle(() => css`
    :host { display: block; }

    .carousel {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      padding: 4px 0 8px;
      -webkit-overflow-scrolling: touch;
    }
    .carousel::-webkit-scrollbar { display: none; }

    .carousel-item {
      flex-shrink: 0;
      scroll-snap-align: start;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .carousel-item:hover { transform: scale(1.02); }

    /* multi-browse: first item wide, rest smaller */
    .multi-browse .carousel-item      { width: 160px; height: 220px; }
    .multi-browse .carousel-item:first-child { width: 220px; }

    .uncontained .carousel-item { width: 220px; height: 220px; }

    .full-screen .carousel-item {
      width: calc(100% - 32px);
      height: 320px;
    }

    .item-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .item-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--md-sys-color-surface-variant, #E7E0EC);
    }
    .placeholder-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 48px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
    }

    .item-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 16px;
      background: linear-gradient(transparent, rgba(0,0,0,0.55));
      color: #fff;
    }
    .item-headline {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      line-height: 20px;
    }
    .item-supporting {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 12px;
      font-weight: 400;
      margin: 0;
      opacity: 0.8;
      line-height: 16px;
    }
  `);

  return html`
    <div :class="${{ carousel: true, [props.variant]: true }}" role="list">
      ${each(
        Array.isArray(props.items) ? props.items : [],
        (item: CarouselItem) => html`
          <div key="${item.id}" class="carousel-item" role="listitem">
            ${item.image
              ? html`<img class="item-bg" src="${item.image}" alt="${item.headline || ''}" loading="lazy">`
              : html`
                <div class="item-placeholder" style="${item.color ? 'background:' + item.color : ''}">
                  <span class="placeholder-icon">image</span>
                </div>
              `
            }
            ${when(!!(item.headline || item.supportingText), () => html`
              <div class="item-overlay">
                ${when(!!item.headline, () => html`<p class="item-headline">${item.headline}</p>`)}
                ${when(!!item.supportingText, () => html`<p class="item-supporting">${item.supportingText}</p>`)}
              </div>
            `)}
          </div>
        `,
      )}
    </div>
  `;
});

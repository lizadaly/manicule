import { CollationMember } from './collation.js'
import { cacheableImage, iiif } from './image.js'

export class SpreadViewer extends CollationMember {
  region = 'full'
  defaultWidth = 1750
  defaultHeight = 2423

  static get observedAttributes () {
    return ['index']
  }

  get width () {
    return +this.getAttribute('width') || this.defaultWidth
  }

  get height () {
    return +this.getAttribute('height') || this.defaultHeight
  }

  get default () {
    return this.getAttribute('default') || 'loading-icon.svg'
  }

  connectedCallback () {
    super.connectedCallback()
  }

  attributeChangedCallback (name, oldValue) {
    // Fire the render method only when the attribute has been dynamically updated
    if (name === 'index' && oldValue) {
      this.render()
    }
  }

  ready = () => {
    this.render()
  }

  render = () => {
    const index = +this.getAttribute('index')
    const spread = this.collation.data.derived.linear[index]
    const hasVerso = this.collation.data.derived.leaves[spread[0].id].params.folio_number
    const hasRecto = this.collation.data.derived.leaves[spread[1].id].params.folio_number
    const verso = cacheableImage(
      this.width,
      this.height,
      'leaf',
      {},
      hasVerso ? this.default : 'document-icon.svg'
    )
    const recto = cacheableImage(
      this.width,
      this.height,
      'leaf',
      {},
      hasRecto ? this.default : 'document-icon.svg'
    )

    if (hasVerso) {
      verso.setAttribute(
        'data-url',
        this.collation.imageDir
          ? `${this.collation.imageDir}/leaf${spread[0].parentOrder}-${spread[0].side}${spread[0].id}.jpg`
          : iiif(spread[0].params.image.url, this.region, this.width, this.height)
      )
    }
    if (hasRecto) {
      recto.setAttribute(
        'data-url',
        this.collation.imageDir
          ? `${this.collation.imageDir}/leaf${spread[1].parentOrder}-${spread[1].side}${spread[1].id}.jpg`
          : iiif(spread[1].params.image.url, this.region, this.width, this.height)
      )
    }
    this.shadowRoot.replaceChildren(...[verso, recto])

    this.shadowRoot.lastChild.insertAdjacentHTML(
      'afterend',
      `<style>
          :host {
              display: flex;
              align-items: center;
              width: 100%;          
          }
          img { 
              height: auto;
              max-width: 50%;
          }
          img.selected {
              outline: 5px solid var(--highlight-color);
              z-index: 99;            
          }
          img.leaf {
              width: auto;
              height: auto;
              max-width: 100%;
          }
          img[src$="loading-icon.svg"] {
              opacity: 0.25;
              scale: 0.25;
              animation: spin 1.5s infinite linear;
          }
          @keyframes spin {
              from {
                  transform: rotate(0deg);
              }
              to {
                  transform: rotate(360deg);
              }
          }
          
      </style>`
    )
  }
}

export class LeafNav extends CollationMember {
  connectedCallback () {
    super.connectedCallback()
  }

  get spread () {
    return this.collation.querySelector('spread-viewer')
  }

  get current () {
    return +this.spread.getAttribute('index')
  }

  get hasNext () {
    return this.current + 1 < this.collation.data.derived.linear.length
  }

  get hasPrevious () {
    return this.current - 1 >= 0
  }

  ready = () => {
    const button = document.createElement('button')
    button.textContent = this.getAttribute('direction')
    this.shadowRoot.append(button)

    button.addEventListener('click', () => {
      if (this.getAttribute('direction') === 'next' && this.hasNext) {
        this.spread.setAttribute('index', this.current + 1)
      } else if (this.getAttribute('direction') === 'previous' && this.hasPrevious) {
        this.spread.setAttribute('index', this.current - 1)
      }
    })
  }
}

import {
  CollationModel
} from './collation.js'
import {
  StructureView,
  StructureLeaf
} from './structure.js'
import {
  SpreadViewer,
  LeafNav
} from './spread.js'
import {
  NavStrip
} from './navstrip.js'

customElements.define('collation-model', CollationModel)
customElements.define('nav-strip', NavStrip)
customElements.define('spread-viewer', SpreadViewer)
customElements.define('leaf-nav', LeafNav)
customElements.define('structure-view', StructureView)
customElements.define('structure-leaf', StructureLeaf)

// ESC resets all zoom options
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Escape': {
      for (const spread of document.querySelectorAll('spread-viewer')) {
        for (const img of spread.shadowRoot.querySelectorAll('img.selected')) {
          img.zoomed = false
          img.selected = false
          img.style.translate = '0px 0px'
          img.style.transform = 'scale(1)'
          img.classList.remove('selected')
          img.zIndex = 1
        }
      }
    }
  }
})

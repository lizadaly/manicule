import { CollationMember } from './collation.js'
import { cacheableImage, iiif } from './image.js'

export class StructureView extends CollationMember {
  defaultWidth = 50
  defaultHeight = 50
  defaultSide = 'verso'

  ns = 'http://www.w3.org/2000/svg'

  static get observedAttributes () {
    return ['quire', 'side']
  }

  connectedCallback () {
    this.quireIds = undefined
    super.connectedCallback()
  }

  get quireId () {
    return +this.getAttribute('quire')
  }

  get width () {
    return +this.getAttribute('width') || this.defaultWidth
  }

  get height () {
    return +this.getAttribute('height') || this.defaultHeight
  }

  get side () {
    return this.getAttribute('side') || this.defaultSide
  }

  /**
   * @param {number | string} width
   */
  set width (width) {
    this.setAttribute('width', width)
  }

  /**
   * @param {number | string} height
   */
  set height (height) {
    this.setAttribute('height', height)
  }

  /**
   * @param {string} side
   */
  set side (side) {
    this.setAttribute('side', side)
  }

  attributeChangedCallback (name, prev, value) {
    switch (name) {
      case 'quires': {
        this.render()
        break
      }
      case 'side': {
        for (const button of this.shadowRoot.querySelectorAll(
          '[data-type="side-toggle"]'
        )) {
          button.innerText = this.side
        }
        const groups = [...this.shadowRoot.querySelectorAll('structure-leaf')]

        for (const group of groups) {
          group.setAttribute('side', this.side)
        }
      }
    }
  }

  ready = () => {
    this.render()
  }

  render = () => {
    this.shadowRoot.replaceChildren()

    if (this.quireId) {
      this.quires = this.collation.data.derived.quires.filter(
        (quire) => quire.id === this.quireId
      )
    } else {
      this.quires = this.collation.data.derived.quires
    }
    for (const quire of this.quires) {
      const row = document.createElement('div')
      this.shadowRoot.append(row)
      quire.sewing = quire.sewing.map(id => `${id}`) // convert the sewing IDs to strings
      const header = document.createElement('h2')
      header.innerText = `Quire ${quire.id}`
      const displaySide = document.createElement('button')
      displaySide.setAttribute('data-type', 'side-toggle')
      displaySide.innerText = this.side
      displaySide.addEventListener('click', () => {
        this.side = this.side === 'recto' ? 'verso' : 'recto'
      })
      header.append(displaySide)
      row.append(header)

      const svg = document.createElementNS(this.ns, 'svg')
      row.append(svg)

      for (const leafId of quire.leaves) {
        const leaf = this.collation.data.derived.leaves[leafId - 1] // leaves is an array so -1

        // Always render both sides, but one will be invisible

        const recto = {
          side: 'recto',
          data: this.collation.data.derived.rectos[leaf.rectoOrder]
        }
        const verso = {
          side: 'verso',
          data: this.collation.data.derived.versos[leaf.versoOrder]
        }

        const group = document.createElement('structure-leaf')
        group.setAttribute('width', this.width)
        group.setAttribute('height', this.height)
        group.setAttribute('side', this.side)
        group.setAttribute('has-images', this.collation.hasImages)
        group.recto = recto
        group.verso = verso
        group.leaf = leaf
        group.imageDir = this.collation.imageDir
        row.append(group)
      }

      const leaves = [
        ...row.querySelectorAll('structure-leaf[data-conjoined-leaf-id]')
      ]

      // TODO come back to this; this was needed to get them to paint before calculating their position
      requestAnimationFrame(() => {
        const left = leaves[0].getBoundingClientRect()
        const right = leaves[leaves.length - 1].getBoundingClientRect()
        const center = (right.right - left.x) / 2
        const svgRect = svg.getBoundingClientRect()

        let i = 0
        const arcHeightIncrement = 15

        // Loop over the elements as rendered to draw their lines
        for (const leaf of leaves) {
          const id = leaf.getAttribute('data-leaf-id')
          const lrect = leaf.getBoundingClientRect()
          // Start and end coordinates for the lines
          const startx = lrect.x - svgRect.left + lrect.width / 2
          const starty = svgRect.height

          let height = 0
          // Take the index up until we hit the midpoint
          if (i < leaves.length / 2) {
            height = i * arcHeightIncrement
          } else {
            height = (leaves.length - i - 1) * arcHeightIncrement
          }
          height = height + 5

          const path = document.createElementNS(this.ns, 'path')

          // Draw a cubic bezier curve with two control points relative to the distance between the nodes
          const d = `M ${startx} ${starty} C ${startx} ${height}, ${center} ${height}, ${center} ${height}`
          if (leaf.getAttribute('data-mode') === 'missing') {
            path.setAttribute('stroke-dasharray', '5,5')
          }

          path.setAttributeNS(null, 'd', d)
          path.setAttributeNS(null, 'data-leaf-id', id)
          path.setAttributeNS(null, 'center', center)
          path.setAttributeNS(null, 'height', height)
          // Set a listener on the path and the image to display the relevant terms based on the current side
          const togglePath = (e) => {
            e.target.getRootNode()
              .querySelector(`structure-leaf[data-leaf-id="${id}"]`)
              .shadowRoot.querySelectorAll(`figcaption[data-side="${this.side}"] dl`)
              .forEach((dl) => dl.classList.toggle('hide'))
            leaf.classList.toggle('hover')
            path.classList.toggle('hover')
          }
          path.addEventListener('mouseover', togglePath)
          path.addEventListener('mouseout', togglePath)

          const toggleLeaf = (e) => {
            e.target.shadowRoot
              .querySelectorAll(`figcaption[data-side="${this.side}"] dl`)
              .forEach((dl) => dl.classList.toggle('hide'))
            leaf.classList.toggle('hover')
            path.classList.toggle('hover')
          }
          leaf.addEventListener('mouseover', toggleLeaf)
          leaf.addEventListener('mouseout', toggleLeaf)

          svg.append(path)
          i++
        }
        if (quire.sewing.length > 0) {
          const start = svg.querySelector(`path[data-leaf-id="${quire.sewing[0]}"]`)
          const end = svg.querySelector(`path[data-leaf-id="${quire.sewing[1]}"]`)
          const line = document.createElementNS(this.ns, 'line')
          line.setAttribute('x1', start.getAttribute('center'))
          line.setAttribute('y1', start.getAttribute('height'))
          line.setAttribute('x2', end.getAttribute('center'))
          line.setAttribute('y2', end.getAttribute('height'))
          svg.append(line)
        }
      })
    }
    this.shadowRoot.lastChild.insertAdjacentHTML(
      'afterend',
      `<style>
          :host {
              display: flex;
              flex-wrap: wrap;
              flex-direction: column;
          }
          div {
              white-space: nowrap;
              margin-bottom: 60px;
          }
          [data-type="side-toggle"] {
              background: none;
              color: var(--dark-color);
              border: 1px solid var(--dark-color);
              display: block;
              margin: 1rem 0;
          }
          svg {
              display: block;
              height: 80px;
              width: 100%;
          }
          svg path {
              stroke: black;
              stroke-width: 2;
              fill: transparent;
          }
          svg line {
            stroke: orange;
            stroke-width: 2;
            fill: transparent;
          
          }
          svg path.hover {
              stroke: var(--highlight-color);
              stroke-width: 3;
          }
          </style>
          `
    )
  }
}

export class StructureLeaf extends HTMLElement {
  static get observedAttributes () {
    return ['side']
  }

  region = 'square'

  // Contains two leaf images, one for each side
  constructor () {
    super()
    this.recto = undefined
    this.verso = undefined
    this.leaf = undefined
    this.imageDir = undefined
    this.attachShadow({ mode: 'open' })
  }

  get width () {
    return +this.getAttribute('width') || this.defaultWidth
  }

  get height () {
    return +this.getAttribute('height') || this.defaultHeight
  }

  get side () {
    return this.getAttribute('side') || this.defaultSide
  }

  get hasImages () {
    return this.getAttribute('has-images') || true
  }

  /**
   * @param {number | string} width
   */
  set width (width) {
    this.setAttribute('width', width)
  }

  /**
   * @param {number | string} height
   */
  set height (height) {
    this.setAttribute('height', height)
  }

  /**
   * @param {string} side
   */
  set side (side) {
    this.setAttribute('side', side)
  }

  /**
   * @param {boolean} hasImages
   */
  set hasImages (hasImages) {
    this.setAttribute('has-images', hasImages)
  }

  connectedCallback () {
    this.style.width = `${this.width}px`
    this.style.height = `${this.height}px`
    const { recto, verso, leaf, imageDir } = this

    const figure = document.createElement('figure')
    this.shadowRoot.append(figure)

    for (const sideData of [recto, verso]) {
      const img = cacheableImage(
        this.width,
        this.height,
        'structure-leaf-image',
        {
          'data-leaf-id': leaf.id,
          'data-conjoined-leaf-id': leaf.conjoined_leaf_order,
          'data-side': sideData.side,
          'data-facing': sideData.side === this.side ? 'front' : 'back'
        }
      )
      img.setAttribute(
        'data-facing',
        sideData.side === this.side ? 'front' : 'back'
      )

      this.setAttribute('data-leaf-id', leaf.id)
      this.setAttribute('data-conjoined-leaf-id', leaf.conjoined_leaf_order)
      this.setAttribute('data-mode', leaf.params.type.toLowerCase())

      const terms = document.createElement('dl')
      terms.setAttribute('data-leaf-id', leaf.id)
      terms.classList.add('hide')

      // Aggregate term data from leaves and sides
      const pageInfo = document.createElement('span')
      const folio = leaf.params.folio_number ? `folio ${leaf.params.folio_number} / ` : ''
      pageInfo.innerText = `${folio} ${sideData.side} ${sideData.data.id}`
      terms.append(pageInfo)

      for (const term of [...leaf.terms, sideData.terms].filter(t => t)) {
        const taxonomy = document.createElement('dt')
        const title = document.createElement('dd')
        taxonomy.innerText = term.taxonomy
        title.innerText = term.title
        terms.append(taxonomy, title)
      }

      // FIXME determine how to handle deliberately-missing images
      const url = imageDir
        ? `${imageDir}/leaf${leaf.id}-${this.side.charAt(0)}${leaf.id}.jpg`
        : iiif(
          sideData.data.params.image.url,
          this.region,
          this.width,
          this.height
        )
      img.setAttribute(
        'data-url',
        this.hasImages ? url : img.src
      )
      figure.append(img)

      const caption = document.createElement('figcaption')
      caption.setAttribute(
        'data-side', sideData.side)
      figure.append(caption)

      // TODO associate the figure and the capture since it's not connected in the DOM
      // <figure role="region" aria-labelledby="caption-text"> + id
      caption.append(terms)
    }
    this.shadowRoot.lastChild.insertAdjacentHTML(
      'afterend',
      `<style>
          :host {
              display: inline-block;
              perspective: 600px;
          }
          [data-type="structure-leaf-image"] {
              display: inline-block;
          }
          [data-type="structure-leaf-image"].hover {
              outline: inset 2px var(--highlight-color);
          }
          [data-type="structure-leaf-image"] {
              position: absolute;
              height: 100%;
              width: 100%;
              backface-visibility: hidden;
          }
          [data-type="structure-leaf-image"][data-facing="back"] {
              transform: rotateY(180deg);
          }
          .is-flipped {
              transform: rotateY(180deg);
          }
          /* Un-rotate the caption */
          .is-flipped figcaption {
              transform: rotateY(180deg);
          }
          figcaption {
              position: absolute;
              bottom: -60px;
              width: 100%;
              height: 3rem;
          }
          figcaption dt {
              display: none;
          }
          figcaption * {
              margin: 0;
          }
          figure {
              margin: 0;
              width: 100%;
              height: 100%;
          
              position: relative;
              transition: transform 1s;
              transform-style: preserve-3d;
          }
          img:not([src]) {
            visibility: hidden;
          }
          span {
            display: block;
          }
          span:first-letter {
            text-transform: capitalize;
          }
          .hide {
              display: none;
          }
          </style>`
    )
  }

  attributeChangedCallback (name, prev, value) {
    switch (name) {
      case 'side': {
        for (const fig of this.shadowRoot.querySelectorAll('figure')) {
          fig.classList.toggle('is-flipped')
        }
      }
    }
  }
}

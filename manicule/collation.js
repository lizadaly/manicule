const COLLATION_READY_EVENT = 'collation-ready'

export class CollationModel extends HTMLElement {
  static get observedAttributes () {
    return ['ready']
  }

  constructor () {
    super()
    this.data = {}
    this.hasImages = true
    this.insertAdjacentHTML(
      'afterbegin',
      `<style>
              :host { 
                  container-type: size;
                  container-name: outer;
              }
              .errors {
                color: red;
              }
       </style>
       <div class="errors"></div>
       `
    )
  }

  get path () {
    return this.getAttribute('path')
  }

  get imageDir () {
    return this.getAttribute('image-dir')
  }

  async connectedCallback () {
    const resp = await fetch(this.path)
    this.data = await resp.json()

    // If there's no IIIF manifest, warn that we'll need local images
    console.log(this.data.project.manifests.length)
    if ((!this.data.project.manifests || Object.keys(this.data.project.manifests).length === 0) && !this.imageDir) {
      this.querySelector('.errors').innerText = 'No IIIF manifest was found; images need to be provided locally via the `image-dir` attribute.'
      this.hasImages = false
    }
    // "Derived" data is computed by us from the collation model
    this.data.derived = {}

    const rectos = Object.entries(this.data.Rectos).map(([id, data]) => {
      data.id = +id
      return data
    })
    const versos = Object.entries(this.data.Versos).map(([id, data]) => {
      data.id = +id
      return data
    })

    this.data.derived.rectos = {}
    this.data.derived.versos = {}

    for (const page of rectos) {
      page.terms = Object.values(this.data.Terms).map((term) => {
        if (term.objects.Recto.includes(page.id)) {
          return term.params
        }
        return null
      }).filter(term => term)
      this.data.derived.rectos[page.id] = page
    }
    for (const page of versos) {
      page.terms = Object.values(this.data.Terms).map((term) => {
        if (term.objects.Verso.includes(page.id)) {
          return term.params
        }
        return null
      }).filter(term => term)
      this.data.derived.versos[page.id] = page
    }

    this.data.derived.leaves = Object.entries(this.data.Leafs).map(
      ([id, data]) => {
        data.id = +id
        data.terms = Object.values(this.data.Terms).map((term) => {
          if (term.objects.Leaf.includes(data.id)) {
            return term.params
          }
          return null
        })
          .filter((term) => term)
        return data
      }
    )

    this.data.derived.linear = versos.map((e, i) => [{ ...e, side: 'v' }, { ...rectos[i], side: 'r' }])
    this.data.derived.linear = this.data.derived.linear.filter(
      (e) => e[0].params.image?.url
    ) // FIXME allow for this to be missing

    this.data.derived.quires = []
    for (const [id, data] of Object.entries(this.data.Groups)) {
      if (data.params.type === 'Quire') {
        data.id = +id
        data.leaves = []
        // Get leaf ids
        for (const leafIdLabel of data.memberOrders.filter((id) =>
          id.includes('Leaf_')
        )) {
          const leafId = +leafIdLabel.split('Leaf_')[1]
          data.leaves.push(leafId)
        }
        this.data.derived.quires.push(data)
      }
    }
    console.log(this.data.derived)
    this.dispatchEvent(
      new CustomEvent(COLLATION_READY_EVENT, {
        composed: true,
        bubbles: true,
        cancelable: false
      })
    )

    this.populateMetadata()

    this.setAttribute('ready', true)
  }

  attributeChangedCallback (name, _, value) {
    if (name === 'ready' && value === 'true') {
      console.log(`Collation ${this.path} ready.`)
    }
  }

  populateMetadata = () => {
    // For all child nodes that want to be annotated, populate them
    for (const el of this.querySelectorAll('[data-project]')) {
      const attr = el.getAttribute('data-project')

      // Deconstruct simple ('title') or complex ('metadata.date') expressions
      const data = attr.split('.').reduce((o, i) => o[i], this.data.project)
      if (data) {
        el.textContent = data
      } else {
        console.warn(
          `data-project parameter "${attr}" wasn't found in the JSON data for ${this.path}`
        )
      }
    }
  }
}
export class CollationMember extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback () {
    const collation = this.collation
    collation.addEventListener(COLLATION_READY_EVENT, this.ready, {
      passive: true,
      once: true,
      composed: true
    })
  }

  ready = () => {
    throw new Error("Method 'ready()' must be implemented.")
  }

  get collation () {
    return this.closest('collation-model')
  }
}

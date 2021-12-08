import defaultStructure from '../data/default/structure.xml'
import defaultData from '../data/default/pages.json'
import defaultTour from '../tour/default/tour.json'

import testData from '../data/test/pages.json'
import testTour from '../tour/test/tour.json'

console.log(defaultStructure)
const categoryColors: Record<string, string> = {
    flyleaf: '#000000',
    'Reeve’s Tale': '#2550a1',
    'Cook’s Tale': '#658539',
    'Man of Law’s Tale': '#963f39',
    'Canon’s Yeoman’s Tale': '#876331',
    'Tale of Sir Thopas': '#b09e8d',
    'Parson’s Tale': '#cae1ed',
    'Squire’s Tale': '#365414'
}

export type EditionName = string

// Get the current quire from the page structure for the current verso page
export const getCurrentQuire = (edition: EditionName, pageIndex: number) => {
    const quires = metadata[edition].structure.quire
    let quire
    let page

    quires.forEach((q) => {
        const leaves = q.leaf
        leaves.forEach((l) => {
            const pages = l.page
            pages.forEach((p) => {
                // eslint-disable-line consistent-return
                if (p.$.index === pageIndex.toString()) {
                    quire = q
                    page = p
                }
            })
        })
    })
    return { quire, page }
}

export type Page = {
    index: number
    signatures: string
    pagenum: string
    category: string
    description: string
    color?: string
}

export type PageData = Record<number, Page>


// get all of the information about the individual pages in the book
export const getPageData = (pages: Page[]) => {
    let data: Page[] = []

    pages.forEach((p) => {
        const item = Object.assign({ color: '' }, p)
        item.color = categoryColors[item.category]
        data[item.index] = item
    })
    return data
}

export type TourData = TourItem[]

export interface TourItem {
    item: number
    page: number
    images: string[]
}

// Given an edition, find any possible tour data for a page
export const getTourForPage = (edition: EditionName, page: number) => {
    const tour = metadata[edition].tour
    const data = tour.filter((item) => item.page === page)[0]
    return data
}

export type Metadata = Record<string, MetadataRecord>

export interface LeafPage {
    "$": {
        index: string
        pagenum: string
        side: "r" | "v"
    }
}
export interface Leaf {
    "$": {
        n: string
        mode: string
        single: "true" | "false"
        folio_number: string
        conjoin: string
    }
    page: LeafPage[]
}
export interface Quire {
    leaf: Leaf[]
}

export interface Structure {
    url?: string
    title?: string
    author?: string
    source?: string
    quire: Quire[]
}
export type MetadataRecord = {
    structure: Structure
    pages: PageData
    tour: TourData
}

export const metadata:Metadata = {
    default: {
        structure: defaultStructure.book,
        pages: getPageData(defaultData),
        tour: defaultTour
    },
    test: {
        structure: {
            quire: []
        },
        pages: getPageData(testData),
        tour: testTour
    }
}
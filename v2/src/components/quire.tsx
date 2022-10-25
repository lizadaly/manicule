import React from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { LeafSide, Quire as IQuire } from 'metadata'
import styles from 'styles/Structure.module.css'
import { EditionContext } from 'containers/SiteContainer'

import Thumbnail from './thumbnail'

const ns = 'http://www.w3.org/2000/svg'

/**
 * Each Quire element will display one or more Leaves.
 */
interface QuireProps {
    quire: IQuire
    side: LeafSide
}
const Quire = ({ quire, side }: QuireProps) => {
    const pageData = React.useContext(EditionContext).pages

    const index = side === 'recto' ? 0 : 1
    const svgRef = React.useRef<SVGSVGElement>(null)

    const [leafRefs] = React.useState(() =>
        quire.leaf.map((l) => React.createRef<HTMLDivElement>())
    )

    const drawLines = () => {
        if (svgRef.current) {
            const svg = svgRef.current
            const arrowid = Math.floor(Math.random() * 10000)
            // Delete any previous svg children
            svg.innerHTML = `<defs>
            <marker id="id-${arrowid}" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>`
            // Get the positions of all the rendered leaf nodes in this quire
            quire.leaf.forEach((l, i) => {
                // Does this leaf have a conjoined leaf?
                const conjoinedId = l.conjoin && l.conjoin > l.n ? l.conjoin : null
                const conjoined = quire.leaf.filter((l) => l.n === conjoinedId)[0]

                if (conjoinedId) {
                    const left = leafRefs[i]
                    const right = leafRefs[quire.leaf.indexOf(conjoined)]

                    if (left?.current && right?.current) {
                        const lrect = left.current.getBoundingClientRect()
                        const rrect = right.current.getBoundingClientRect()

                        // Start and end coordinates for the lines
                        const startx = lrect.x + lrect.width / 2
                        const starty = 210
                        const endx = rrect.x + rrect.width / 2
                        const endy = 210

                        // Control points are based on the midpoint between left and right, plus the offset (`extra`)
                        const dist = (lrect.x + rrect.x + rrect.width) / 2

                        // Height of the control points should be the same, and relative to the distance between the nodes,
                        // clamped so they start low enough to see (0) but don't descend into the nodes (150)
                        const relativeDistance = rrect.x - lrect.x * 1.2
                        const height = Math.min(Math.max(20, 300 - relativeDistance), 150)

                        const leftControlX = Math.max(dist - dist * 4, startx)
                        const rightControlX = Math.min(endx, dist + dist * 4)

                        const path = document.createElementNS(ns, 'path')

                        // Draw a cubic bezier curve with two control points relative to the distance between the nodes
                        const d = `M ${startx} ${starty} C ${leftControlX} ${height}, ${rightControlX} ${height}, ${endx} ${endy}`

                        path.setAttributeNS(null, 'd', d)

                        svg.appendChild(path)
                    }
                } else if (l.single === 'true') {
                    const node = leafRefs[i]
                    if (node.current) {
                        const line = document.createElementNS(ns, 'line')
                        const { x, width } = node.current.getBoundingClientRect()
                        const center = x + width / 2
                        line.setAttribute('x1', `${center}`)
                        line.setAttribute('x2', `${center}`)
                        line.setAttribute('y1', `${150}`)
                        line.setAttribute('y2', `${190}`)
                        line.setAttribute('marker-end', `url(#id-${arrowid})`)
                        svg.appendChild(line)
                    }
                }
            })
        }
    }
    const debounced = useDebouncedCallback(drawLines, 100)
    React.useLayoutEffect(() => {
        drawLines()
        window.addEventListener('resize', debounced)
        return () => {
            window.removeEventListener('resize', debounced)
        }
    })
    return (
        <div className={styles.quire}>
            <svg xmlns={ns} ref={svgRef}></svg>
            {quire.leaf.map((leaf, i) => {
                const page = pageData.get(leaf.page[index].index)
                const key = leaf.folio_number
                const ref = leafRefs[i]

                return page ? (
                    <div className={styles.leaf} key={key} ref={ref}>
                        <Thumbnail page={page} />
                    </div>
                ) : null
            })}
        </div>
    )
}

export default Quire

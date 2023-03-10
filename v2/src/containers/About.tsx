// Don't edit this page; edit about.html at the top of the project
import React from 'react'
import { Row, Col } from 'react-bootstrap'

import styles from 'styles/About.module.css'

export default class AboutPage extends React.Component {
    render() {
        return (
            <div className={styles.about}>
                <Row>
                    <Col>
                        <div className="about">
                            <h1>About Manicule</h1>
                            <p>
                                Manicule is a standalone React web application for presenting unique
                                printed books and manuscripts in digital facsimile. It allows
                                editors to:
                            </p>
                            <h3>
                                <span className={styles.accent}>☞</span> build guided tours through
                                a book’s distinguishing features;
                            </h3>
                            <img
                                src="images/tour.png"
                                alt="Screenshot of the Tour feature of the application, showing multiple windows over the source text"
                            />
                            <h3>
                                <span className={styles.accent}>☞</span> annotate the edges of
                                interesting pages with extra information;
                            </h3>
                            <img
                                src="images/marginalia.png"
                                alt="Screenshot showing annotation added in the marginal area of the screen"
                            />
                            <h3>
                                <span className={styles.accent}>☞</span> categorize and color-code
                                each page in the facsimile, giving a bird’s-eye view of a book’s
                                main elements;
                            </h3>
                            <img
                                src="images/map.png"
                                alt="Narrow screenshot of the multi-colored 'map' of categorized elements"
                            />
                            <h3 className="indent">
                                <span className={styles.accent}>☞</span> and visualize the book’s
                                structure.
                            </h3>
                            <img
                                src="images/structure.png"
                                alt="Screenshot of the structure visualization, showing arcing lines that illustrate the way the book was bound"
                            />
                            <h1>Credits</h1>
                            <p>
                                Manicule was built and designed by{' '}
                                <a href="https://lizadaly.com/">Liza Daly</a> and{' '}
                                <a href="http://whitneyannetrettien.com/">Whitney Trettien</a> with
                                support from the{' '}
                                <a href="https://pricelab.sas.upenn.edu/">
                                    Price Lab for Digital Humanities
                                </a>{' '}
                                at the University of Pennsylvania.
                            </p>
                            <h1>Download</h1>
                            <p>
                                Version 1.0 of Manicule was released in October 2018. The source
                                code is available for reuse under a{' '}
                                <a href="https://creativecommons.org/licenses/by/4.0/">
                                    Creative Commons Attribution 4.0 International License
                                </a>
                                . Download it here:{' '}
                                <a href="https://github.com/wtrettien/manicule">
                                    https://github.com/wtrettien/manicule
                                </a>
                                . Instructions for installing, building, and deploying the app are
                                available in README.md and at the Github repository.
                            </p>
                            <p>
                                Let us know how you use Manicule by emailing Whitney Trettien:{' '}
                                <b>trettien [at] english [dot] upenn [dot] edu</b>.
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}

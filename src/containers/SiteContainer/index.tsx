import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { Grid, Navbar } from 'react-bootstrap'
import cc from '../../images/cc.svg'
import by from '../../images/by.svg'
import manic from '../../images/manicule-white.png'

import { metadata, PageData, Structure, TourData, EditionName } from '../../utils/metadata'

interface EditionContextProps {
    edition: EditionName
    pages: PageData
    structure: Structure
    tour: TourData
}

export const EditionContext = React.createContext<Partial<EditionContextProps>>({})

const SiteContainer: React.FC = ({ children }) => {
    let { editionName } = useParams()

    const edition = editionName || 'benlowe'
    const { pages, structure, tour } = metadata[edition]
    const context = {
        edition,
        pages,
        structure,
        tour
    }
    const location = useLocation()
    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [location])
    return (
        <EditionContext.Provider value={context}>
            <Grid>
                <Navbar inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <li>
                                <Link to="/">
                                    <img src={manic} alt="Manicule home page" /> Manicule
                                </Link>
                            </li>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <ul className="nav navbar-nav">
                        <li>
                            <Link to={`/reader`}>Browse</Link>
                        </li>
                        <li>
                            <Link to="/structure">Structure</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                        </li>
                    </ul>
                </Navbar>

                {children}

                <footer>
                    This work is licensed under a{' '}
                    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
                        Creative Commons Attribution 4.0 International License
                    </a>{' '}
                    <img src={cc} alt="Creative Commons" style={{ height: '2em' }} />
                    <img src={by} alt="Attribution" style={{ height: '2em' }} />
                </footer>
            </Grid>
        </EditionContext.Provider>
    )
}
export default SiteContainer

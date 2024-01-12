import "../app/main.css"

export const NavBarContainer = ({ children }) => {
  return (
    <>
      {children}
      <nav className="navbar">
        <ul>
          <li>
            <a className="d-none d-md-block" href="/">High-Resolution Course Feedback</a>
            <a className="d-block d-md-none" href="/">HRCF</a>
          </li>
          <li>
            <a className="d-none d-sm-block" href="javascript:void(0)">The Team</a>
            <a className="d-block d-sm-none" href="javascript:void(0)">Team</a>
          </li>
          <li>
            <a className="d-none d-md-block" href="javascript:void(0)">Terms of Service</a>
            <a className="d-block d-md-none" href="javascript:void(0)">Terms</a>
          </li>
          {/*
          <li>
            <a className="d-none d-md-block" href="/terms-of-service">Terms of Service</a>
            <a className="d-block d-md-none" href="/terms-of-service">Terms</a>
          </li>
          */}
          <li>
            <a className="d-none d-md-block" href="javascript:void(0)">Contact Us</a>
            <a className="d-block d-md-none" href="javascript:void(0)">Contact</a>
          </li>
        </ul>
      </nav>
    </>
  )
}

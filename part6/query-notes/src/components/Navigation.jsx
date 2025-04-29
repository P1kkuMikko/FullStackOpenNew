import { Navbar, Nav } from 'react-bootstrap';

// eslint-disable-next-line react/prop-types
const Navigation = ({ user }) => {
  const padding = {
    padding: 5,
  };

  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <Navbar.Toggle aria-controls='responsive-navbar-nav' />
      <Navbar.Collapse id='responsive-navbar-nav'>
        <Nav className='mr-auto'>
          <Nav.Link href='#' as='span'>
            <span style={padding}>Notes</span>
          </Nav.Link>
          <Nav.Link href='#' as='span'>
            <span style={padding}>Users</span>
          </Nav.Link>
          <Nav.Link href='#' as='span'>
            {user ? (
              <em style={padding}>{user} logged in</em>
            ) : (
              <span style={padding}>login</span>
            )}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;

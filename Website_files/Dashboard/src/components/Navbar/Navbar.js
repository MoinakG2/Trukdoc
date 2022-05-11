import React from 'react';
import {
  Avatar,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouteLink } from 'react-router-dom';
import { Logo } from '../../Logo';
import { ColorModeSwitcher } from '../../ColorModeSwitcher';
import { ArrowForwardIcon, PhoneIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <Flex h="10vh" align="center" px={3} py={2} fontSize="md" fontWeight="600">
      <HStack h="100%" spacing={5}>
        <Logo h="80%" />
        <Link as={RouteLink} to="/dashboard">
          Dashboard
        </Link>
        <Link as={RouteLink} to="/help">
          Help
        </Link>
      </HStack>
      <Spacer />
      <HStack spacing={5}>
        <Link href="tel:+911800320500">
          <PhoneIcon />
          1800-320-250
        </Link>
        <Menu>
          <Menu>
            {({ isOpen }) => (
              <>
                <MenuButton isActive={isOpen}>
                  {isOpen ? <Avatar icon={<TriangleUpIcon />} /> : <Avatar />}
                </MenuButton>
                <MenuList fontWeight="500" width="fit-content">
                  <MenuItem
                    onClick={() => auth.signOut().then(navigate('/login'))}
                  >
                    Logout
                  </MenuItem>
                  <MenuItem>FAQs</MenuItem>
                  <MenuItem>Contact Us</MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        </Menu>
        <ColorModeSwitcher />
      </HStack>
    </Flex>
  );
};

export default Navbar;

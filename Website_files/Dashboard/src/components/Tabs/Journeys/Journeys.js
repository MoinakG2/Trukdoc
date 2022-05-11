import { PhoneIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tag,
  TagLeftIcon,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { db } from '../../../firebase';

const Th2 = props => <Th alignItems="center">{props.children}</Th>;

const Journeys = props => {
  const [search, setSearch] = useState('');
  const data = props.data.journeys
    .map(e => {
      let truck = props.data.trucks.find(o => o.id === e.data().truck)?.data();
      let driver = props.data.drivers
        .find(o => o.id === e.data().driver)
        ?.data();
      return {
        ...e.data(),
        id: e.id,
        truck: truck?.number,
        driver: driver?.name,
      };
    })
    .filter(
      e =>
        e.truck.toLowerCase().includes(search.toLowerCase()) ||
        e.driver.toLowerCase().includes(search.toLowerCase())
    );
  const toast = useToast();
  return (
    <Box>
      <InputGroup size="sm">
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300" />}
        />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Enter truck number or driver name"
          width="30%"
        />
      </InputGroup>
      <Table mt={5}>
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th2>Truck Number</Th2>
            <Th2>Driver Name</Th2>
            <Th2>
              <TimeIcon mr={2} />
              Created at
            </Th2>
            <Th width="0" />
          </Tr>
        </Thead>
        <Tbody>
          {data.map(e => (
            <Tr>
              <Td>{e.truck}</Td>
              <Td>{e.driver}</Td>
              <Td>{e.createdAt.toDate().toLocaleString()}</Td>
              <Td>
                <Menu>
                  <MenuButton fontWeight="900" fontSize="130%">
                    &#8942;
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        db.doc('/journeys/' + e.id)
                          .delete()
                          .then(() =>
                            toast({
                              title: 'Trip Deleted',
                              description:
                                'Journey has been deleted successfully',
                              status: 'success',
                              duration: 5000,
                              isClosable: true,
                            })
                          );
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Journeys;

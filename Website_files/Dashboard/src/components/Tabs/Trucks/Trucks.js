import { PhoneIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
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
  useToast,
  Tr,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { db } from '../../../firebase';

const Th2 = props => <Th alignItems="center">{props.children}</Th>;

const AddTruck = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState();
  const [number, setNumber] = useState();
  return (
    <>
      <Button ml={5} onClick={onOpen} size="sm" colorScheme="red">
        Add New Truck
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a new Truck</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={number}
              onChange={e => setNumber(e.target.value)}
              required
              placeholder="Enter Truck Number"
            />
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter Model Name"
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                db.collection('trucks')
                  .add({
                    owner: props.user.uid,
                    name: name,
                    number: number,
                  })
                  .then(() => onClose());
              }}
              colorScheme="red"
            >
              Add Truck
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Trucks = props => {
  const [search, setSearch] = useState('');
  const data = props.data.trucks
    .map(e => {
      let journey = props.data.journeys
        .filter(o => o.data().truck === e.id)[0]
        ?.data();
      return {
        ...e.data(),
        id: e.id,
        active: journey?.active,
        driving: journey?.driving,
      };
    })
    .filter(
      e =>
        e.number.toLowerCase().includes(search.toLowerCase()) ||
        e.name.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Enter truck number or model"
          width="30%"
        />
        <AddTruck user={props.data.user} />
      </InputGroup>
      <Table mt={5}>
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th2>Truck Number</Th2>
            <Th2>Model Name</Th2>
            <Th2>
              <TimeIcon mr={2} />
              Journey Status
            </Th2>
            <Th width="0" />
          </Tr>
        </Thead>
        <Tbody>
          {data.map(e => (
            <Tr>
              <Td>{e.number}</Td>
              <Td>{e.name}</Td>
              <Td>
                {e.active ? (
                  <Tag colorScheme="green">In Transit</Tag>
                ) : (
                  <Tag colorScheme="gray">Inactive</Tag>
                )}
              </Td>
              <Td>
                <Menu>
                  <MenuButton fontWeight="900" fontSize="130%">
                    &#8942;
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={props.openHistory}>
                      View History
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        db.doc('/trucks/' + e.id)
                          .delete()
                          .then(() =>
                            toast({
                              title: 'Truck Deleted',
                              description:
                                'Truck has been deleted successfully',
                              status: 'success',
                              duration: 5000,
                              isClosable: true,
                            })
                          );
                      }}
                    >
                      Delete Truck
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

export default Trucks;

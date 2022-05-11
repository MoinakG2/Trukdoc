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
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { db } from '../../../firebase';

const Th2 = props => <Th alignItems="center">{props.children}</Th>;

const AddDriver = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState();
  const [number, setNumber] = useState();
  return (
    <>
      <Button ml={5} onClick={onOpen} size="sm" colorScheme="red">
        Add New Driver
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a new Driver</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter Name"
            />
            <Input
              value={number}
              onChange={e => setNumber(e.target.value)}
              required
              placeholder="Enter Number"
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                db.collection('drivers')
                  .add({
                    owner: props.user.uid,
                    name: name,
                    number: number,
                  })
                  .then(() => onClose());
              }}
              colorScheme="red"
            >
              Add Driver
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Drivers = props => {
  const [search, setSearch] = useState('');
  const data = props.data.drivers
    .map(e => {
      let journey = props.data.journeys
        .filter(o => o.data().driver === e.id)[0]
        ?.data();
      return {
        ...e.data(),
        id: e.id,
        active: journey?.active,
        driving: journey?.driving,
      };
    })
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
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
          placeholder="Enter driver name"
          width="30%"
        />
        <AddDriver user={props.data.user} />
      </InputGroup>
      <Table mt={5}>
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th2>
              <Avatar size="2xs" mr={2} />
              Name
            </Th2>
            <Th2>
              <PhoneIcon mr={2} />
              Phone Number
            </Th2>
            <Th2>
              <TimeIcon mr={2} />
              Journey Status
            </Th2>
            <Th2>
              <TagLeftIcon mr={2} />
              Driving Status
            </Th2>
            <Th width="0" />
          </Tr>
        </Thead>
        <Tbody>
          {data.map(e => (
            <Tr>
              <Td display="flex" alignItems="center" fontWeight="500">
                <Avatar name={e.name} src={e.profile} mr={2} />
                {e.name}
              </Td>
              <Td>{e.number}</Td>
              <Td>
                {e.active ? (
                  <Tag colorScheme="green">In Transit</Tag>
                ) : (
                  <Tag colorScheme="gray">Inactive</Tag>
                )}
              </Td>
              <Td>
                {e.driving ? (
                  <Tag colorScheme="green">Driving</Tag>
                ) : e.active ? (
                  <Tag colorScheme="yellow">Stopped</Tag>
                ) : (
                  <Tag colorScheme="gray">N/A</Tag>
                )}
              </Td>
              <Td>
                <Menu>
                  <MenuButton fontWeight="900" fontSize="130%">
                    &#8942;
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        db.doc('/drivers/' + e.id)
                          .delete()
                          .then(() =>
                            toast({
                              title: 'Driver Deleted',
                              description:
                                'Driver has been deleted successfully',
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

export default Drivers;

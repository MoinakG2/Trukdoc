import { PhoneIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
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
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { db } from '../../../firebase';

const Th2 = props => <Th alignItems="center">{props.children}</Th>;

const History = props => {
  const data = [
    {
      date: '13th March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: ['Low tyre pressure'],
    },
    {
      date: '12th March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: [],
    },
    {
      date: '11th March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: [],
    },
    {
      date: '5th March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: [],
    },
    {
      date: '4th March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: ['Low tyre pressure'],
    },
    {
      date: '3rd March, 2022',
      driver: {
        name: 'Dilbagh Singh',
        number: '9166099990',
        profile: 'https://bit.ly/sage-adebayo',
      },
      journey: 'From NH4, Faridabad to Gulshan Dhaba, Murthal',
      distance: '300 Km',
      issues: [],
    },
  ];
  const [trkNumber, setTrkNumber] = useState('HR 33A 2309');
  return (
    <Box>
      <InputGroup size="sm">
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300" />}
        />
        <Input placeholder="Enter truck number" width="30%" value={trkNumber} />
        <Input placeholder="Enter date (optional)" width="30%" />
      </InputGroup>
      <Heading size="md" mt={5}>
        Showing truck history of {trkNumber}
      </Heading>
      <Table mt={5}>
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th2>Date</Th2>
            <Th2>Driver</Th2>
            <Th2>Journey</Th2>
            <Th2>Distance</Th2>
            <Th2>Issues</Th2>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(e => (
            <Tr>
              <Td>{e.date}</Td>
              <Td display="flex" alignItems="center" fontWeight="500">
                <Avatar name={e.driver.name} src={e.driver.profile} mr={2} />
                <Box>
                  <Text>{e.driver.name}</Text>
                  <Text fontWeight="400">{e.driver.number}</Text>
                </Box>
              </Td>
              <Td>{e.journey}</Td>
              <Td>{e.distance}</Td>
              <Td>
                {e.issues.map(o => (
                  <Button colorScheme="red" isActive variant="ghost" size="sm">
                    {o}
                  </Button>
                ))}
                {e.issues.length === 0 && (
                  <Button
                    colorScheme="green"
                    isActive
                    variant="ghost"
                    size="sm"
                  >
                    All OK
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default History;

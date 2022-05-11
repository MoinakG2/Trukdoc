import { SearchIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spacer,
  Tag,
  TagLabel,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';

const Warning = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  return (
    <>
      <Button
        colorScheme="red"
        isActive
        variant="ghost"
        size="sm"
        onClick={onOpen}
      >
        {props.warning.message}
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {props.warning.message}
            </AlertDialogHeader>

            <AlertDialogBody>
              Detected at {props.warning.timestamp.toDate().toLocaleString()}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onClose} ml={3}>
                Find Mechanic
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const Card = props => (
  <Flex
    direction="column"
    pos="relative"
    height="18rem"
    maxW="30rem"
    border="1px"
    borderColor="blackAlpha.100"
    boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
    borderRadius="8px"
    fontWeight="500"
    p={3}
  >
    <Button
      variant="outline"
      size="sm"
      pos="absolute"
      right={3}
      onClick={() =>
        window.open(
          'https://www.google.com/maps/search/?api=1&query=' +
            props.location[props.location.length - 1],
          '_blank'
        )
      }
    >
      View on map
    </Button>
    <Box fontWeight="600" fontSize="lg">
      {props.trkNumber}
    </Box>
    <Box fontSize="sm">{props.trkName}</Box>
    <Spacer />
    <Flex>
      <Avatar name={props.driver} mr={2} />
      <Box>
        <Text fontWeight="600">Driver</Text>
        <Text color="gray.600">{props.driver}</Text>
      </Box>
    </Flex>
    <Spacer />
    <Box>
      <Text fontWeight="600">Location</Text>
      <Text color="gray.600">{props.location[props.location.length - 1]}</Text>
    </Box>
    <Spacer />
    <Box>
      <Text fontWeight="600">Part Check</Text>
      {props.warnings.map(e => (
        <Warning warning={e} />
      ))}
      {props.warnings.length === 0 && (
        <Button colorScheme="green" isActive variant="ghost" size="sm">
          All OK
        </Button>
      )}
    </Box>
  </Flex>
);

const Transit = props => {
  const [search, setSearch] = useState('');
  const data = props.data.journeys
    .filter(e => e.data().active)
    .map(e => {
      let truck = props.data.trucks.find(o => o.id === e.data().truck)?.data();
      let driver = props.data.drivers
        .find(o => o.id === e.data().driver)
        ?.data();
      console.log(truck);
      return {
        trkName: truck?.name,
        trkNumber: truck?.number,
        driver: driver?.name,
        location: e.data().location,
        warnings: e.data().warnings,
      };
    })
    .filter(
      e =>
        e.trkNumber.toLowerCase().includes(search.toLowerCase()) ||
        e.driver.toLowerCase().includes(search.toLowerCase())
    );
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
      <HStack my={5}>
        <Tag size="lg">
          <TagLabel>{data.length} in transit</TagLabel>
        </Tag>
        <Tag size="lg">
          <TagLabel>
            {data.reduce((total, e) => (total += e.warnings.length !== 0), 0)}{' '}
            trucks needs fixes
          </TagLabel>
        </Tag>
      </HStack>
      <SimpleGrid minChildWidth="18rem" spacing={10}>
        {data.map(e => (
          <Card {...e} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Transit;

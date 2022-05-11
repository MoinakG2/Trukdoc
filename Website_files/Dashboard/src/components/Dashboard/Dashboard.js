import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { AddIcon } from '@chakra-ui/icons';
import Transit from '../Tabs/Transit/Transit';
import Drivers from '../Tabs/Drivers/Drivers';
import Trucks from '../Tabs/Trucks/Trucks';
import { firebase, auth, db } from '../../firebase';
import { Navigate } from 'react-router-dom';
import History from '../Tabs/History/History';
import Journeys from '../Tabs/Journeys/Journeys';

const CreateTrip = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [driver, setDriver] = useState();
  const [truck, setTruck] = useState();
  const toast = useToast();
  return (
    <>
      <Button leftIcon={<AddIcon />} colorScheme="red" onClick={onOpen}>
        Create Trip
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Journey</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              value={driver}
              onChange={e => setDriver(e.target.value)}
              required
              placeholder="Select Driver"
            >
              {props.data.drivers.map(e => (
                <option value={e.id}>{e.data().name}</option>
              ))}
            </Select>
            <Select
              value={truck}
              onChange={e => setTruck(e.target.value)}
              required
              placeholder="Select Truck"
            >
              {props.data.trucks.map(e => (
                <option value={e.id}>{e.data().number}</option>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                db.collection('journeys')
                  .add({
                    owner: props.data.user.uid,
                    createdAt: firebase.firestore.Timestamp.now(),
                    driver: driver,
                    truck: truck,
                    active: false,
                    warnings: [],
                    driving: false,
                    location: 'NH4, Faridabad, Haryana',
                  })
                  .then(() => {
                    onClose();
                    toast({
                      title: 'Trip created',
                      description: 'Journey has been added successfully',
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                    });
                  });
              }}
              colorScheme="red"
            >
              Create Trip
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Dashboard = props => {
  const user = props.user;
  const [drivers, driversLoading, driversError] = useCollection(
    db.collection('drivers').where('owner', '==', user.uid)
  );
  const [trucks, trucksLoading, trucksError] = useCollection(
    db.collection('trucks').where('owner', '==', user.uid)
  );
  const [journeys, journeysLoading, journeysError] = useCollection(
    db
      .collection('journeys')
      .orderBy('createdAt', 'desc')
      .where('owner', '==', user.uid)
  );
  const [tabIndex, setTabIndex] = useState(0);
  if (driversLoading || trucksLoading || journeysLoading)
    return <p>Loading data...</p>;
  if (driversError) return <p>Error: {driversError.message}</p>;
  if (trucksError) return <p>Error: {trucksError.message}</p>;
  if (journeysError) return <p>Error: {journeysError.message}</p>;
  const data = {
    user,
    drivers: drivers.docs,
    trucks: trucks.docs,
    journeys: journeys.docs,
  };
  return (
    <Box p={12}>
      <Flex align="center" mb={12}>
        <Heading fontWeight="500">Dashboard</Heading>
        <Spacer />
        <CreateTrip data={data} />
      </Flex>
      <Tabs
        index={tabIndex}
        onChange={index => setTabIndex(index)}
        variant="line"
        colorScheme="red"
      >
        <TabList>
          <Tab>
            In Transit ({data.journeys.filter(e => e.data().active).length})
          </Tab>
          <Tab>History</Tab>
          <Tab>Trucks ({data.trucks.length})</Tab>
          <Tab>Drivers ({data.drivers.length})</Tab>
          <Tab>Created journeys</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Transit data={data} />
          </TabPanel>
          <TabPanel>
            <History />
          </TabPanel>
          <TabPanel>
            <Trucks data={data} openHistory={() => setTabIndex(0)} />
          </TabPanel>
          <TabPanel>
            <Drivers data={data} />
          </TabPanel>
          <TabPanel>
            <Journeys data={data} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const DashboardAuthWrap = () => {
  const [user, loading, error] = useAuthState(auth);
  if (loading) return <p>Initialising User...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <Navigate to="/login" />;
  return <Dashboard user={user} />;
};

export default DashboardAuthWrap;

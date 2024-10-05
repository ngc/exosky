import React from "react";
import {
  Theme,
  Container,
  Heading,
  Text,
  Card,
  Flex,
  Button,
  Grid,
  Select,
  Box,
} from "@radix-ui/themes";
import { Link } from "react-router-dom";

// Clara: I've redesigned the homepage to enhance user engagement and visual appeal.
// The light theme creates a welcoming atmosphere, while the hero section immediately
// captures the user's attention. The 'New Constellations' section now uses a grid layout
// with 3 constellations per row, encouraging exploration and providing a more organized view.
// I've maintained the small borders on the left and right sides of the central column for improved visual structure.
// I've also added a footer to give credit to the creators, as requested.
// The constellation card has been refactored into its own component for better modularity and reusability.

interface Exoplanet {
  name: string;
  description: string;
}

const EXOPLANETS: Exoplanet[] = [
  {
    name: "Exoplanet 1",
    description: "Around the star Proxima Centauri",
  },
  {
    name: "Exoplanet 2",
    description: "Around the star Proxima Centauri",
  },
  {
    name: "Exoplanet 3",
    description: "Around the star Proxima Centauri",
  },
];

interface ConstellationCardProps {
  index: number;
}

const ConstellationCard: React.FC<ConstellationCardProps> = ({ index }) => {
  return (
    <Card>
      <Flex direction="column" gap="3">
        <img
          src={`https://place-hold.it/300x200?text=Constellation ${index}`}
          alt={`Constellation ${index}`}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
        <Text as="p" size="3" weight="bold">
          Constellation Name {index}
        </Text>
        <Text as="p" size="2">
          A brief description of this amazing new constellation.
        </Text>
      </Flex>
    </Card>
  );
};

export const Homepage: React.FC = () => {
  const [selectedExoplanet, setSelectedExoplanet] = React.useState<Exoplanet>(
    EXOPLANETS[0]
  );

  return (
    <Theme appearance="light" accentColor="blue" grayColor="sand">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderLeft: "1px solid var(--gray-5)",
          borderRight: "1px solid var(--gray-5)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          size="3"
          px={{ initial: "4", sm: "6", lg: "9" }}
          style={{ flex: 1 }}
        >
          {/* Hero Section */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ minHeight: "60vh" }}
          >
            <Heading size="9" align="center" mb="4">
              Welcome to Exosky
            </Heading>
            <Text size="5" align="center" mb="6">
              Explore the universe and create your own constellations
            </Text>
            <Flex align="center" gap="4">
              <Button size="4" asChild>
                <Link to="/sky">Start Exploring</Link>
              </Button>
              <Select.Root
                value={selectedExoplanet.name}
                onValueChange={(value) =>
                  setSelectedExoplanet(
                    EXOPLANETS.find((e) => e.name === value) || EXOPLANETS[0]
                  )
                }
              >
                <Select.Trigger
                  placeholder="Select an Exoplanet"
                  style={{ height: "45px", padding: "0 16px" }}
                />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Exoplanets</Select.Label>
                    {EXOPLANETS.map((exoplanet, index) => (
                      <Select.Item key={index} value={exoplanet.name}>
                        {exoplanet.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          {/* New Constellations Section */}
          <Flex direction="column" align="center">
            <Heading size="8" mb="6">
              New Constellations
            </Heading>
            <Grid columns="3" gap="4" width="100%">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ConstellationCard key={i} index={i} />
              ))}
            </Grid>
          </Flex>
        </Container>

        {/* Footer */}
        <Box
          py="4"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            align="center"
            size="2"
            style={{ textAlign: "center", width: "100%" }}
          >
            Created with ❤️ by Nathan Coulas, Jack Quinn, Julie Wechsler and
            Daphne Papadatos
          </Text>
        </Box>
      </div>
    </Theme>
  );
};

export default Homepage;

import React, { useEffect } from "react";
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
import * as Accordion from "@radix-ui/react-accordion";
import { Link, useNavigate } from "react-router-dom";

// Clara: I've completely revamped the homepage to align with the new vision for Exosky.
// The design now emphasizes the cosmic journey and storytelling aspects, creating an
// immersive and inspiring experience for users. The layout is more dynamic, with a
// starry background and celestial imagery to set the mood.

// Design Decision: Enhanced FAQ Styling
// I've significantly improved the styling of the FAQ accordion to create a more
// visually appealing and user-friendly experience. The new design features a
// space-themed gradient background, subtle animations, and improved typography
// to better fit the overall aesthetic of Exosky.

interface Exoplanet {
  name: string;
  description: string;
  id: number;
}

interface ConstellationCardProps {
  constellation: Constellation;
}

const ConstellationCard: React.FC<ConstellationCardProps> = ({
  constellation,
}) => {
  return (
    <Card
      style={{
        background: "rgba(0, 0, 0, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Flex direction="column" gap="3">
        <img
          src={constellation.image_data}
          alt={`Constellation ${constellation.id}`}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
        <Text as="p" size="3" weight="bold" style={{ color: "#fff" }}>
          {constellation.name} by {constellation.user_name}
        </Text>
        <Text as="p" size="2" style={{ color: "#ccc" }}>
          {constellation.description}
        </Text>
      </Flex>
    </Card>
  );
};

export const Homepage: React.FC = () => {
  const [exoplanets, setExoplanets] = React.useState<Exoplanet[] | null>(null);
  const [selectedExoplanet, setSelectedExoplanet] =
    React.useState<Exoplanet | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/exoplanets")
      .then((response) => response.json())
      .then((data: Exoplanet[]) => {
        setExoplanets(data);
      });
  }, []);

  const navigate = useNavigate();

  if (!exoplanets) return <div>Loading...</div>;

  return (
    <Theme appearance="dark" accentColor="blue" grayColor="sand">
      <div
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
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
            style={{ minHeight: "80vh", textAlign: "center" }}
          >
            <img
              src="Exosky.png"
              alt="Exosky logo"
              style={{
                maxWidth: "150px",
                marginBottom: "2rem",
              }}
            />
            <Heading size="9" style={{ color: "#fff", marginBottom: "1rem" }}>
              Embark on a Cosmic Odyssey with Exosky
            </Heading>
            <Text
              size="5"
              style={{ color: "#ccc", maxWidth: "800px", marginBottom: "2rem" }}
            >
              Unveil the universe from perspectives beyond imagination. Step
              into a realm where the night sky transforms with every new world
              you explore. Create constellations, weave myths, and share your
              cosmic stories.
            </Text>
            <Flex align="center" gap="4">
              <Button
                onClick={() => {
                  if (selectedExoplanet) {
                    navigate(`/sky/${selectedExoplanet.id}`);
                  }
                }}
                size="4"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
                disabled={!selectedExoplanet}
              >
                Start Your Journey
              </Button>

              <Select.Root
                value={selectedExoplanet?.name}
                onValueChange={(value) =>
                  setSelectedExoplanet(
                    exoplanets.find((e) => e.name === value) || exoplanets[0]
                  )
                }
              >
                <Select.Trigger
                  placeholder="Choose Your Exoplanet"
                  style={{
                    height: "45px",
                    padding: "0 16px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Exoplanets</Select.Label>
                    {exoplanets.map((exoplanet, index) => (
                      <Select.Item key={index} value={exoplanet.name}>
                        {exoplanet.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Flex>
            <Flex style={{ marginTop: "2rem" }}>
              <Button
                onClick={() => navigate("/sky/earth")}
                size="4"
                style={{
                  background: "rgba(100, 200, 100,1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                View from Earth
              </Button>
            </Flex>
          </Flex>

          {/* About Exosky Section */}
          <Box my="9">
            <Heading
              size="8"
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              Welcome to Exosky
            </Heading>
            <Text
              size="4"
              style={{
                color: "#ccc",
                textAlign: "center",
                maxWidth: "800px",
              }}
            >
              Exosky is a platform that invites you to journey across the cosmos
              and rediscover the stars through the eyes of distant exoplanets.
              If you've ever gazed up at the night sky and felt the allure of
              the stars, imagine how different the heavens would appear from
              worlds light-years away. Exosky makes this imagination a reality,
              bridging the gap between science and creativity, and offering you
              a canvas as vast as the universe itself.
            </Text>
            <Grid columns="3" gap="4" style={{ marginTop: "2rem" }}>
              <Card
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Heading
                  size="6"
                  style={{ color: "#fff", marginBottom: "1rem" }}
                >
                  Explore Distant Horizons
                </Heading>
                <Text size="3" style={{ color: "#ccc" }}>
                  Choose from a curated list of real exoplanets and witness the
                  night sky as seen from your chosen world. Experience how the
                  stars and celestial bodies rearrange into unfamiliar
                  configurations.
                </Text>
              </Card>
              <Card
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Heading
                  size="6"
                  style={{ color: "#fff", marginBottom: "1rem" }}
                >
                  Become a Celestial Storyteller
                </Heading>
                <Text size="3" style={{ color: "#ccc" }}>
                  Draw your own constellations, craft shapes and patterns that
                  hold personal significance, and weave myths and legends around
                  your creations.
                </Text>
              </Card>
              <Card
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Heading
                  size="6"
                  style={{ color: "#fff", marginBottom: "1rem" }}
                >
                  Share Your Cosmic Creations
                </Heading>
                <Text size="3" style={{ color: "#ccc" }}>
                  Publish your constellations and stories, allowing others to
                  see, appreciate, and be inspired by your work. Explore
                  creations from users around the globe.
                </Text>
              </Card>
            </Grid>
          </Box>

          {/* FAQ Section */}
          <Box my="9">
            <Heading
              size="8"
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              Frequently Asked Questions
            </Heading>
            <Accordion.Root
              type="single"
              collapsible
              style={{
                background: "linear-gradient(45deg, #000 34%, #16213e)",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <AccordionItem value="item-1" question="What is Exosky?">
                Exosky is a platform that allows you to explore the night sky
                from the perspective of distant exoplanets. You can create your
                own constellations, craft stories, and share your cosmic
                creations with a community of stargazers and storytellers.
              </AccordionItem>
              <AccordionItem value="item-2" question="What is an exoplanet?">
                An exoplanet, or extrasolar planet, is a planet that orbits a
                star other than our Sun. These distant worlds come in a variety
                of sizes and compositions, from gas giants to rocky planets
                potentially similar to Earth. Exoplanets have revolutionized our
                understanding of planetary systems and the potential for life
                beyond our solar system.
              </AccordionItem>
              <AccordionItem
                value="item-3"
                question="How does Exosky simulate exoplanet night skies?"
              >
                Exosky uses advanced astronomical data and algorithms to
                calculate the positions of stars as they would appear from the
                surface of known exoplanets. We take into account the properties
                of its host star to create an accurate representation of its
                night sky.
              </AccordionItem>
              <AccordionItem
                value="item-4"
                question="Do I need to be an astronomer to use Exosky?"
              >
                Not at all! Exosky is designed for everyone, from curious
                beginners to seasoned space enthusiasts. Our user-friendly
                interface makes it easy for anyone to start their cosmic
                journey. We provide information about each exoplanet and its
                star system to help you understand what you're seeing.
              </AccordionItem>
              <AccordionItem
                value="item-5"
                question="How do I create a constellation?"
              >
                After selecting an exoplanet, you'll see its night sky. Simply
                connect the stars by clicking on them to form your
                constellation. You can then name it and write a story or myth to
                go along with your creation. Our intuitive tools make it easy to
                bring your celestial visions to life.
              </AccordionItem>
              <AccordionItem
                value="item-7"
                question="Is Exosky scientifically accurate?"
              >
                Exosky strives for scientific accuracy in its representation of
                exoplanets and star positions. We use data from NASA, CSA, ESA,
                and other reputable astronomical sources to ensure the accuracy
                of our celestial maps. However, it also embraces creativity and
                imagination in the creation of constellations and stories. It's
                a perfect blend of science and art!
              </AccordionItem>
            </Accordion.Root>
          </Box>

          {/* Featured Constellations Section */}
          <Box my="9">
            <Heading
              size="8"
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              Celestial Creations
            </Heading>
            <Text
              size="4"
              style={{
                color: "#ccc",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto 3rem",
              }}
            >
              Explore constellations crafted by our community of cosmic
              storytellers. Each pattern tells a unique tale from across the
              universe.
            </Text>
            <Constellations />
          </Box>
        </Container>

        {/* Footer */}
        <Box
          py="4"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <Text align="center" size="2" style={{ color: "#ccc" }}>
            Crafted with cosmic love by the Exosky Team
          </Text>
        </Box>
      </div>
    </Theme>
  );
};

export interface Constellation {
  id: number;
  name: string;
  description: string;
  user_name: string;
  image_data: string;
}

function Constellations() {
  const [constellations, setConstellations] = React.useState<
    Constellation[] | null
  >(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/get-constellations")
      .then((response) => response.json())
      .then((data: Constellation[]) => setConstellations(data));
  }, []);

  if (!constellations) return <div>Loading celestial wonders...</div>;

  return (
    <Grid columns="3" gap="4">
      {constellations.map((constellation) => (
        <ConstellationCard
          key={constellation.id}
          constellation={constellation}
        />
      ))}
    </Grid>
  );
}

const AccordionItem: React.FC<{
  value: string;
  question: string;
  children: React.ReactNode;
}> = ({ value, question, children }) => (
  <Accordion.Item
    value={value}
    style={{
      marginBottom: "16px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    }}
  >
    <Accordion.Trigger
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "16px",
        backgroundColor: "transparent",
        border: "none",
        color: "#fff",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
    >
      {question}
    </Accordion.Trigger>
    <Accordion.Content
      style={{
        padding: "0 16px 16px",
        color: "#ccc",
        fontSize: "16px",
        lineHeight: "1.6",
        overflow: "hidden",
        transition: "all 0.3s ease-out",
      }}
    >
      {children}
    </Accordion.Content>
  </Accordion.Item>
);

export default Homepage;

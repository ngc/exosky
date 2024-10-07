import { useState, useEffect, useCallback } from "react";
import { Button, Dialog, Flex, TextArea, TextField } from "@radix-ui/themes";
import { StarData } from "./Skyview";
import { generateConstellationImage } from "./generate";
import { Constellation } from "./Homepage";

async function uploadConstellation(constellation: Omit<Constellation, "id">) {
  const response = await fetch("http://127.0.0.1:5001/submit-constellation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(constellation),
  });
}

// Loading screen component
const LoadingScreen: React.FC = () => {
  const loadingMessages = [
    "Channeling Chris Hadfield's guitar skills...",
    "Calculating light-years...",
    "Warming up the warp drive...",
    "Adjusting Roberta Bondar's camera focus...",
    "Decoding alien signals...",
    "Mapping the Milky Way...",
    "Activating Julie Payette's mission controls...",
    "Charging photon torpedoes...",
    "Recalibrating black hole detectors...",
    "Syncing with Bjarni Tryggvason's fluid dynamics...",
    "Aligning Marc Garneau's space station modules...",
    "Tuning David Saint-Jacques' space radio...",
    "Preparing Jeremy Hansen's spacewalk equipment...",
    "Analyzing Jenni Sidey-Gibbons' space experiments...",
    "Calibrating Steve MacLean's space vision system...",
    "Initializing Dave Williams' space medical protocols...",
    "Powering up Robert Thirsk's space laboratory...",
    "Engaging Ken Money's zero-gravity simulations...",
    "Launching Dafydd Williams' space robotics...",
    "Activating Joshua Kutryk's deep space communications...",
  ];

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [stars, setStars] = useState<
    { x: number; y: number; opacity: number }[]
  >([]);

  useEffect(() => {
    let lastMessage = "";
    const messageInterval = setInterval(() => {
      let newMessage;
      do {
        newMessage =
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      } while (newMessage === lastMessage);
      setCurrentMessage(newMessage);
      lastMessage = newMessage;
    }, 3000);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 1, 100));
    }, 200);

    const starInterval = setInterval(() => {
      setStars((prevStars) =>
        [
          ...prevStars,
          {
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: Math.random(),
          },
        ].slice(-50)
      ); // Keep only the last 50 stars
    }, 200);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearInterval(starInterval);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {stars.map((star, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: star.opacity,
          }}
        />
      ))}
      <div
        style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        {currentMessage}
      </div>
      <div
        style={{
          width: "300px",
          height: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${loadingProgress}%`,
            height: "100%",
            backgroundColor: "white",
            transition: "width 0.2s ease-in-out",
          }}
        />
      </div>
      <div
        style={{
          color: "white",
          fontSize: "16px",
          textAlign: "center",
          maxWidth: "30%",
          lineHeight: "1.5",
        }}
      >
        Welcome to Exosky! Once loaded, you'll be able to explore the night sky
        from different exoplanets. Click on stars to create your own
        constellations, then name and describe them to share your cosmic stories
        with others. Use your mouse to navigate the sky view. Enjoy your
        interstellar journey!
      </div>
    </div>
  );
};

export function HUD({
  selectedStars,
  isLoadingStars,
}: {
  selectedStars: StarData[];
  isLoadingStars: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constellationName, setConstellationName] = useState("");
  const [userName, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [errors, setErrors] = useState<{
    constellationName?: string;
    userName?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!constellationName.trim()) {
      newErrors.constellationName = "Constellation name is required";
    } else if (constellationName.length > 50) {
      newErrors.constellationName =
        "Constellation name must be 50 characters or less";
    }
    if (!userName.trim()) {
      newErrors.userName = "Your name is required";
    } else if (userName.length > 50) {
      newErrors.userName = "Your name must be 50 characters or less";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        await uploadConstellation({
          name: constellationName.trim(),
          description: description.trim(),
          user_name: userName.trim(),
          image_data: base64Image,
        });
        // Show success message
        alert("Your constellation has been successfully submitted!");
        // Reset form
        setConstellationName("");
        setUserName("");
        setDescription("");
        setBase64Image("");
        setIsModalOpen(false);
        // Redirect to homepage
        window.location.href = "/";
      } catch (error) {
        console.error("Error submitting constellation:", error);
        alert(
          "There was an error submitting your constellation. Please try again."
        );
      }
    },
    [constellationName, description, userName, base64Image]
  );

  return (
    <>
      {isLoadingStars && <LoadingScreen />}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <h1>Create your own constellation</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <p>
            Look up at the night sky around you and click different stars to
            build your own constellation.
          </p>
          <p>
            Learn more about constellations{" "}
            <a
              href="https://en.wikipedia.org/wiki/Constellation"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
          </p>
        </div>
        {/* Additional HUD elements can be added here */}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
        }}
      >
        <Button
          onClick={() => {
            setBase64Image(generateConstellationImage(selectedStars));
            setIsModalOpen(true);
          }}
          disabled={selectedStars.length === 0}
        >
          Submit your constellation
        </Button>
        {isModalOpen && (
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Content
              style={{
                maxWidth: "90vw",
                width: "100%",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <div style={{ flex: 1, marginRight: "24px" }}>
                <Dialog.Title
                  style={{
                    fontSize: "24px",
                    marginBottom: "16px",
                    color: "#333333",
                  }}
                >
                  Create Your Celestial Legacy
                </Dialog.Title>
                <Dialog.Description
                  style={{ color: "#666666", marginBottom: "24px" }}
                >
                  Immortalize your discovery in the cosmic tapestry.
                </Dialog.Description>
                <div style={{ position: "relative" }}>
                  <img
                    src={base64Image}
                    alt="Your Constellation"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      marginBottom: "16px",
                      border: "1px solid #cccccc",
                      borderRadius: "8px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "32px",
                      left: "0",
                      right: "0",
                      color: "white",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {constellationName || "Unnamed Constellation"}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <form onSubmit={handleSubmit}>
                  <Flex direction="column" gap="4">
                    <label>
                      <p style={{ color: "#333333", marginBottom: "8px" }}>
                        Constellation Name
                      </p>
                      <TextField.Root
                        placeholder="e.g. Celestial Serpent"
                        value={constellationName}
                        onChange={(e) => setConstellationName(e.target.value)}
                        style={{
                          border: "1px solid #cccccc",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                      {errors.constellationName && (
                        <p style={{ color: "red", marginTop: "4px" }}>
                          {errors.constellationName}
                        </p>
                      )}
                    </label>
                    <label>
                      <p style={{ color: "#333333", marginBottom: "8px" }}>
                        Your Name
                      </p>
                      <TextField.Root
                        placeholder="e.g. Galileo Galilei"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{
                          border: "1px solid #cccccc",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                      {errors.userName && (
                        <p style={{ color: "red", marginTop: "4px" }}>
                          {errors.userName}
                        </p>
                      )}
                    </label>
                    <label>
                      <p style={{ color: "#333333", marginBottom: "8px" }}>
                        The Story Behind Your Constellation
                      </p>
                      <TextArea
                        placeholder={`Remember that many constellations have multiple stories and meanings. What story do you want your constellation to tell?`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                          border: "1px solid #cccccc",
                          borderRadius: "8px",
                          padding: "8px",
                          minHeight: "100px",
                        }}
                      />
                      {errors.description && (
                        <p style={{ color: "red", marginTop: "4px" }}>
                          {errors.description}
                        </p>
                      )}
                    </label>
                    <Button
                      type="submit"
                      style={{
                        background: "#007bff",
                        color: "#ffffff",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.3s",
                      }}
                    >
                      Inscribe in the Stars
                    </Button>
                  </Flex>
                </form>
              </div>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </div>
    </>
  );
}

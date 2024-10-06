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
export function HUD({ selectedStars }: { selectedStars: StarData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constellationName, setConstellationName] = useState("");
  const [description, setDescription] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [userName, setUserName] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      uploadConstellation({
        name: constellationName,
        description,
        user_name: userName,
        image_data: base64Image,
      });
      // go back to homepage
      window.location.href = "/";
    },
    [constellationName, description, userName, base64Image]
  );

  return (
    <>
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
        <h1>Build your own constellation...</h1>
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
                    </label>
                    <label>
                      <p style={{ color: "#333333", marginBottom: "8px" }}>
                        Description
                      </p>
                      <TextArea
                        placeholder="Describe the story behind your constellation..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                          border: "1px solid #cccccc",
                          borderRadius: "8px",
                          padding: "8px",
                          minHeight: "100px",
                        }}
                      />
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

import { useState } from "react";
import { Button, Dialog, Flex, TextArea, TextField } from "@radix-ui/themes";
import { StarData } from "./Skyview";

export function HUD({ selectedStars }: { selectedStars: StarData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constellationName, setConstellationName] = useState("");
  const [description, setDescription] = useState("");

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
        <Button onClick={() => setIsModalOpen(true)}>
          Submit your constellation
        </Button>
        {isModalOpen && (
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Content>
              <Dialog.Title>Submit Your Constellation</Dialog.Title>
              <Dialog.Description>
                Please provide details about your constellation.
              </Dialog.Description>
              <form onSubmit={() => {}}>
                <Flex direction="column" gap="3">
                  <label>
                    <p>Constellation Name</p>
                    <TextField.Root
                      placeholder="Enter constellation name"
                      value={constellationName}
                      onChange={(e) => setConstellationName(e.target.value)}
                    />
                  </label>
                  <label>
                    <p>Description</p>
                    <TextArea
                      placeholder="Describe your constellation"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                  <Button type="submit">Submit</Button>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </div>
    </>
  );
}

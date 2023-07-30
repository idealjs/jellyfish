import BrowserOnly from "@docusaurus/BrowserOnly";
import { PTG, sphereShape } from "@idealjs/ptg";
import React from "react";

const PTGDemo = () => {
  return (
    <BrowserOnly fallback={<div />}>
      {() => {
        return (
          <PTG width={500} height={500} noiseSeed={0} shape={sphereShape} />
        );
      }}
    </BrowserOnly>
  );
};

export default PTGDemo;

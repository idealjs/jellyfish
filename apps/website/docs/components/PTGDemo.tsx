import BrowserOnly from "@docusaurus/BrowserOnly";
import { PTG, sphereShape } from "@idealjs/ptg";
import React, { Suspense } from "react";

const PTGDemo = () => {
  return (
    <BrowserOnly fallback={<div />}>
      {() => {
        return (
          <Suspense fallback={null}>
            <PTG width={500} height={500} noiseSeed={0} shape={sphereShape} />
          </Suspense>
        );
      }}
    </BrowserOnly>
  );
};

export default PTGDemo;

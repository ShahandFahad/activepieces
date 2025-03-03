import { useEmbedding } from "@/components/embed-provider";
import { projectHooks } from "@/hooks/project-hooks";
import { useEffect, useId, useRef } from "react";

const CUSTOM_PROPERTY_CONTAINER_ID = 'custom-property-container';

const CustomProperty = ({
    value,
    onChange,
    code
} : {
    value: unknown;
    onChange: (value: unknown) => void;
    code: string;
}) => {
  const {project} = projectHooks.useCurrentProject();
  const {embedState} = useEmbedding();
  const alreadyRendered = useRef(false);
  const id = useId();
  const containerId = CUSTOM_PROPERTY_CONTAINER_ID+'-'+id;
  useEffect(() => {
    if (alreadyRendered.current) return;
    alreadyRendered.current = true;
    try {
      // Create function that takes a params object
      const fn = new Function('params', `
        return (${code})(params);
      `);
      // Execute the function with args as the params object
      const result = fn({
        containerId,
        value,
        onChange,
        isEmbeded: embedState.isEmbedded,
        projectId: project.id,
      });
      
      // If the result is a Promise, handle it
      if (result instanceof Promise) {
        result.then(onChange).catch(console.error);
      } else {
        onChange(result);
      }
    } catch (error) {
      console.error('Error executing custom code:', error);
    }
  }, [])
    
  return <div id={containerId}></div>;
};

CustomProperty.displayName = 'CustomProperty';
export default CustomProperty;


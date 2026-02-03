import { Button } from "@arco-design/web-react";
import { Dispatch, SetStateAction } from 'react';

interface CreateButtonProps {
    handleCreate: () => void;
  }

const CreateButton = ({ handleCreate }: CreateButtonProps) => {
    return (
        <Button 
            onClick={() => {
                handleCreate();
            }} 
            type='primary' 
            status='success'
        >
            添加酒店
        </Button>
    )
}

export default CreateButton;
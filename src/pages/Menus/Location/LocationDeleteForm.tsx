import DeleteForm from "@/components/DataPage/DeleteForm";

interface LocationDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const LocationDeleteForm: React.FC<LocationDeleteFormProps> = ({ onSubmit, onCancel, submitting, isPermanent = false }) => {
  return <DeleteForm onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} entityName="地點" isPermanent={isPermanent} />;
};

export default LocationDeleteForm;


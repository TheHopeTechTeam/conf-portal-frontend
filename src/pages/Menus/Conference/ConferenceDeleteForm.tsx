import DeleteForm from "@/components/DataPage/DeleteForm";

interface ConferenceDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const ConferenceDeleteForm: React.FC<ConferenceDeleteFormProps> = ({
  onSubmit,
  onCancel,
  submitting,
  isPermanent = false,
}) => {
  return (
    <DeleteForm onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} entityName="會議" isPermanent={isPermanent} />
  );
};

export default ConferenceDeleteForm;


import { useEffect, useState } from 'react';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import {
  getAvailabilityRules,
  selectProcessedAvailabilityRules,
  createAvailabilityRule
} from '../store/slices/availabilitySlice.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { Modal } from '../components/Modal.tsx';
import type { AvailabilityRuleDTO } from '../types/AvailabilityRuleDTO';
import { AvailabilityRuleListItem } from '../components/availability/AvailabilityRuleListItem.tsx';
import { AvailabilityRuleModalContent } from '../components/availability/AvailabilityRuleModalContent.tsx';
import { createPortal } from 'react-dom';


const AvailabilityView: React.FC = () => {
  const dispatch = ourUseDispatch();
  const rules = ourUseSelector(selectProcessedAvailabilityRules);

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const promise = dispatch(getAvailabilityRules());
    return () => promise.abort();
  }, [dispatch]);

  const onAdd = async (rule: AvailabilityRuleDTO) => {
    await dispatch(createAvailabilityRule(rule));
  };

  return (
    <ViewBody id={"AvailabilityView"}>

      <ViewHeader>
        {/* Add button */}
        <div className="flex ml-auto items-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Rule
          </button>
        </div>
      </ViewHeader>

      {/* Existing rules. sort by allows/prevents */}
      <div className="flex-1 overflow-y-auto p-4">
        {rules.length === 0 && (
          <div className="text-center text-light-secondary-text dark:text-dark-secondary-text py-8">
            No availability rules yet. Click "Add Rule" to create one.
          </div>
        )}        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules
            .filter((rule): rule is AvailabilityRuleDTO & { uuid: string } => !!rule.uuid)
            .sort(rule => rule.prevents_booking ? -1 : 1)
            .map(rule => (
              <AvailabilityRuleListItem rule={rule} />
            ))}
        </div>
      </div>

      {/* This is the add modal */}
      {showModal && createPortal(
        <Modal
          label="Add availability rule"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <AvailabilityRuleModalContent
            rule={{} as AvailabilityRuleDTO}
            editing={false}
            onClose={() => setShowModal(false)}
            onDelete={() => {}}
            onSave={onAdd}
          />
        </Modal>,
        document.body
      )}

    </ViewBody>
  );
};

export { AvailabilityView };

import { useEffect, useMemo, useState } from 'react';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import {
  getAvailabilityRules, createAvailabilityRule,
  updateAvailabilityRule,
  deleteAvailabilityRule, makeAvailabilityRuleSelectors
} from '../store/slices/availabilitySlice.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { Modal } from '../components/Modal.tsx';
import type { AvailabilityRuleDTO, ProcessedAvailabilityRuleDTO } from '../types/AvailabilityRuleDTO';
import { AvailabilityRuleModalContent } from '../components/availability/AvailabilityRuleModalContent.tsx';
import { createPortal } from 'react-dom';
import z from 'zod';
import { GenericFilterSortGrid } from '../components/GenericFilterSortGrid.tsx';

// this is the shape of the data in the grid (zod object)
const AvailabilityRuleSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  iana_timezone: z.string(),
  prevents_booking: z.boolean().optional(),
  weekdays: z.array(z.number()).optional(),
  start_datetime: z.date().optional(),
  end_datetime: z.date().optional(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
})

// this is ts type representation of the above
// type AvailabilityRuleSchemaType = z.infer<typeof AvailabilityRuleSchema>

/**
 * Availability Rule View page. Tabulated representation of the rules visible to the user.
 */
const AvailabilityView: React.FC = () => {
  // dispatch
  const dispatch = ourUseDispatch();
  // selectors
  const { selectProcessedRulesAsDate } = useMemo(() => makeAvailabilityRuleSelectors(), []);
  const rules = ourUseSelector(selectProcessedRulesAsDate);
  // state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<ProcessedAvailabilityRuleDTO | null>(null);

  // get rules on load
  useEffect(() => {
    const promise = dispatch(getAvailabilityRules());
    return () => promise.abort();
  }, [dispatch]);

  const onAdd = async (rule: AvailabilityRuleDTO) => {
    await dispatch(createAvailabilityRule(rule));
  };
  const onUpdate = async (ev: AvailabilityRuleDTO) => {
    await dispatch(updateAvailabilityRule(ev));
  };
  const onDelete = async (uuid: string) => {
    await dispatch(deleteAvailabilityRule(uuid));
  };

  return (
    <ViewBody id={"AvailabilityView"}>
      <ViewHeader>
        {/* Add button */}
        <div className="flex ml-auto items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Rule
          </button>
        </div>
      </ViewHeader>

      {/* This is the generic filter grid */}
      <GenericFilterSortGrid schema={AvailabilityRuleSchema} data={rules} rowClickedCallback={(rule: ProcessedAvailabilityRuleDTO) => setSelectedRule(rule)} />

      {/* Add modal */}
      {showAddModal && createPortal(
        <Modal
          label="Add availability rule"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        >
          <AvailabilityRuleModalContent
            rule={{ uuid: "", name: "", iana_timezone: "", start_time: null, end_time: null }}
            editing={false}
            onClose={() => setShowAddModal(false)}
            onDelete={() => { }}
            onSave={onAdd}
          />
        </Modal>,
        document.body
      )}

      {/* Update modal */}
      {selectedRule && createPortal(
        <Modal
          label="Edit availability rule"
          isOpen={!!selectedRule}
          onClose={() => setSelectedRule(null)}
        >
          <AvailabilityRuleModalContent
            rule={selectedRule}
            editing={true}
            onClose={() => setSelectedRule(null)}
            onDelete={onDelete}
            onSave={onUpdate}
          />
        </Modal>,
        document.body
      )}

    </ViewBody>
  );
};

export { AvailabilityView };

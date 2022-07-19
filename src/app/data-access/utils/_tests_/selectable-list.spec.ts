import { SelectableList, SelectableListVM } from '../rsm/selectable-list';

import { ListItem, DATA } from './_data_/list-item.data';

jest.useFakeTimers();

describe('SelectableList<ListItem>', () => {
  const findList = (vm: SelectableListVM<ListItem>) => vm.list;
  const findSelected = (vm: SelectableListVM<ListItem>) => vm.selected;
  const findListLength = (vm) => findList(vm).length;
  const findSelectedLength = (vm) => findSelected(vm).length;
  const findStatusValue = (vm) => vm.status.value;

  let selectable: SelectableList<ListItem>;

  beforeEach(() => {
    selectable = new SelectableList<ListItem>('genres');
  });

  describe('initialization', () => {
    it('should have public properties', () => {
      expect(selectable).toBeTruthy();
      expect(selectable).toHaveProperty('trackLoadStatus');
      expect(selectable).toHaveObservables(['list$', 'selected$', 'status$', 'vm$']);
      expect(selectable).toHaveMethods(['addItems', 'selectItems', 'selectItemsById', 'selectAll']);
      expect(selectable).toHaveMethods(['updateStatus', 'setLoading']);

      expect(selectable.list$).toEmit([]);
      expect(selectable.selected$).toEmit([]);
      expect(selectable.status$).toEmit({ value: 'idle' });

      expect(selectable.vm$).toEmit([], findList);
      expect(selectable.vm$).toEmit([], findSelected);
      expect(selectable.vm$).toEmit('idle', findStatusValue);
    });
  });

  describe('status', () => {
    it('should update after setLoading()', () => {
      expect(selectable.vm$).toEmit('idle', findStatusValue);

      selectable.setLoading(true);
      expect(selectable.vm$).toEmit('pending', findStatusValue);

      selectable.setLoading(false);
      expect(selectable.vm$).toEmit('idle', findStatusValue);
    });

    it('should be "success" after addItems()', () => {
      selectable.setLoading(true);

      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit('success', findStatusValue);

      selectable.setLoading(false);
      expect(selectable.vm$).toEmit('idle', findStatusValue);
    });
  });

  describe('addItems', () => {
    it('should addItems and emit total items', () => {
      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit(2, findListLength);

      selectable.addItems([DATA[0], DATA[1]]); // add same... should NOT change the list
      expect(selectable.vm$).toEmit(2, findListLength);

      selectable.addItems([DATA[2], DATA[3]]); // add same... should NOT change the list
      expect(selectable.vm$).toEmit(4, findListLength);

      expect(selectable.vm$).toEmit(0, findSelectedLength);
    });

    it('should clear existing and then addItems', () => {
      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit(2, findListLength);

      // Clear exist items and then add 2 items
      selectable.addItems([DATA[2], DATA[3]], true);
      expect(selectable.vm$).toEmit(2, findListLength);
    });
  });

  describe('selections', () => {
    beforeEach(() => {
      selectable.addItems(DATA.slice(0, 4));
    });

    it('selectItems() merge items and emit total selected items', () => {
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectItems([DATA[1], DATA[3]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);

      selectable.selectItems([DATA[2]]);
      expect(selectable.vm$).toEmit(3, findSelectedLength);

      selectable.selectItems([DATA[2]]);
      expect(selectable.vm$).toEmit(3, findSelectedLength);
    });

    it('selectItems() should clear existing and select only new items', () => {
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectItems([DATA[1], DATA[3]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);

      // Clear current selection and THEN select the specified items
      selectable.selectItems([DATA[2]], true);
      expect(selectable.vm$).toEmit(1, findSelectedLength);

      selectable.selectItems([DATA[1]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);
    });

    it('selectAll() should select or deselect all items', () => {
      selectable.addItems(DATA, true);

      expect(selectable.vm$).toEmit(DATA.length, findListLength);
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectAll();
      expect(selectable.vm$).toEmit(DATA.length, findSelectedLength);

      selectable.selectAll(false);
      expect(selectable.vm$).toEmit(0, findSelectedLength);
    });
  });
});

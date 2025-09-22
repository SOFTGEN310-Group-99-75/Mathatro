import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardUtils } from '../src/utils/CardUtils';

// Mock Phaser objects for testing
const mockScene = {
    add: {
        container: vi.fn().mockReturnValue({
            add: vi.fn(),
            setSize: vi.fn(),
            setInteractive: vi.fn()
        }),
        rectangle: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setStrokeStyle: vi.fn().mockReturnThis()
        }),
        text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setText: vi.fn().mockReturnThis()
        })
    },
    input: {
        setDraggable: vi.fn()
    }
};

const mockSlot = {
    setCard: vi.fn()
};

describe('CardUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createStandardCard', () => {
        it('should create a standard card with default styling', () => {
            const card = CardUtils.createStandardCard(
                mockScene as any,
                100,
                200,
                'Test Card'
            );

            expect(mockScene.add.container).toHaveBeenCalledWith(100, 200);
            expect(mockScene.add.text).toHaveBeenCalled();
            expect(mockScene.input.setDraggable).toHaveBeenCalled();
        });

        it('should create a non-draggable card when specified', () => {
            const card = CardUtils.createStandardCard(
                mockScene as any,
                100,
                200,
                'Static Card',
                false
            );

            expect(mockScene.input.setDraggable).not.toHaveBeenCalled();
        });
    });

    describe('createPlaceholderCard', () => {
        it('should create a placeholder card with empty text', () => {
            const card = CardUtils.createPlaceholderCard(
                mockScene as any,
                150,
                250
            );

            expect(mockScene.add.container).toHaveBeenCalledWith(150, 250);
            expect(mockScene.add.text).toHaveBeenCalled();
        });
    });

    describe('setCardAsPlaceholder', () => {
        it('should update card appearance to placeholder style', () => {
            const mockCard = {
                list: [
                    null,
                    { fillColor: 0xffffff },
                    { setText: vi.fn() }
                ]
            };

            CardUtils.setCardAsPlaceholder(mockCard);

            expect(mockCard.list[1]?.fillColor).toBeDefined();
            expect(mockCard.list[2]?.setText).toHaveBeenCalledWith('');
        });
    });

    describe('setCardWithContent', () => {
        it('should update card appearance with content', () => {
            const mockCard = {
                list: [
                    null,
                    { fillColor: 0x000000 },
                    { setText: vi.fn() }
                ]
            };

            CardUtils.setCardWithContent(mockCard, 'New Content');

            expect(mockCard.list[1]?.fillColor).toBe(0xffffff);
            expect(mockCard.list[2]?.setText).toHaveBeenCalledWith('New Content');
        });
    });

    describe('createCardsFromArray', () => {
        it('should create multiple cards from array of labels', () => {
            const positions = [{ x: 100, y: 200 }, { x: 200, y: 300 }];
            const labels = ['Card 1', 'Card 2'];

            const cards = CardUtils.createCardsFromArray(
                mockScene as any,
                positions,
                labels
            );

            expect(cards).toHaveLength(2);
            expect(mockScene.add.container).toHaveBeenCalledTimes(2);
        });
    });

    describe('updateCardsInSlots', () => {
        it('should update cards in slots with items', () => {
            const slots = [mockSlot, mockSlot];
            const items = ['Item 1', 'Item 2'];

            CardUtils.updateCardsInSlots(mockScene as any, slots, items);

            expect(mockSlot.setCard).toHaveBeenCalledTimes(2);
        });

        it('should create placeholder cards when items array is empty', () => {
            const slots = [mockSlot];
            const items: any[] = [];

            CardUtils.updateCardsInSlots(mockScene as any, slots, items);

            expect(mockSlot.setCard).toHaveBeenCalledTimes(1);
        });
    });
});

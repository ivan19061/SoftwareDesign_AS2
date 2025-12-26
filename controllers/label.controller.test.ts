import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { LabelController } from './label.controller';
import { HttpError } from '../errors/http-error';
import HttpStatus from 'http-status';

// Mock Service - Simulates database operations without real database
class MockLabelService {
  private labels = [
    { id: 1, name: 'Cat', color: '#FF0000' },
    { id: 2, name: 'Dog', color: '#00FF00' },
    { id: 3, name: 'Otter', color: '#0000FF' }
  ];
  
  // Track how many images use each label
  private imageCounts: { [key: number]: number } = {
    1: 5,  // Cat label is used by 5 images
    2: 0,  // Dog label is not used
    3: 3   // Otter label is used by 3 images
  };

  getLabels() {
    return this.labels;
  }

  countimagebyLabel(labelId: number): number {
    return this.imageCounts[labelId] || 0;
  }

  deleteLabel(labelId: number): void {
    const index = this.labels.findIndex(l => l.id === labelId);
    if (index !== -1) {
      this.labels.splice(index, 1);
    }
  }
}

describe('LabelController', () => {
  let controller: LabelController;
  let mockService: MockLabelService;

  // Run before each test to ensure clean state
  beforeEach(() => {
    mockService = new MockLabelService();
    controller = new LabelController(mockService as any);
  });

  describe('getLabels()', () => {
    it('should successfully return all labels', () => {
      const req = {} as any;
      const result = controller.getLabels(req);
      
      // Verify result has labels property
      expect(result).to.have.property('labels');
      // Verify labels is an array
      expect(result.labels).to.be.an('array');
      // Verify array has 3 items
      expect(result.labels).to.have.length(3);
    });

    it('should return labels with correct properties', () => {
      const req = {} as any;
      const result = controller.getLabels(req);
      
      const firstLabel = result.labels[0];
      // Check if label has required properties
      expect(firstLabel).to.have.property('id');
      expect(firstLabel).to.have.property('name');
      expect(firstLabel).to.have.property('color');
    });
  });

  describe('deleteLabel()', () => {
    it('should successfully delete label not used by any image', () => {
      const req = {
        params: { id: '2' }  // Dog label with 0 images
      } as any;
      
      const result = controller.deleteLabel(req);
      // Should return empty object on success
      expect(result).to.deep.equal({});
    });

    it('should throw BAD_REQUEST error when label_id is invalid', () => {
      const req = {
        params: { id: '' }  // Empty string converts to 0
      } as any;
      
      try {
        controller.deleteLabel(req);
        // If no error thrown, test should fail
        expect.fail('Should have thrown HttpError');
      } catch (error: any) {
        // Verify error is HttpError instance
        expect(error).to.be.instanceOf(HttpError);
        // Verify status code is BAD_REQUEST (400)
        expect(error.statusCode || error.status).to.equal(HttpStatus.BAD_REQUEST);
        // Verify error message contains expected text
        expect(error.message).to.include('invalid label');
      }
    });

    it('should throw error when label_id is NaN', () => {
      const req = {
        params: { id: 'abc' }  // Cannot convert to number
      } as any;
      
      try {
        controller.deleteLabel(req);
        expect.fail('Should have thrown HttpError');
      } catch (error: any) {
        expect(error).to.be.instanceOf(HttpError);
        expect(error.statusCode || error.status).to.equal(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw NOT_ACCEPTABLE error when label is used by images', () => {
      const req = {
        params: { id: '1' }  // Cat label used by 5 images
      } as any;
      
      try {
        controller.deleteLabel(req);
        expect.fail('Should have thrown HttpError');
      } catch (error: any) {
        expect(error).to.be.instanceOf(HttpError);
        // Verify status code is NOT_ACCEPTABLE (406)
        expect(error.statusCode || error.status).to.equal(HttpStatus.NOT_ACCEPTABLE);
        // Verify error message mentions 5 images
        expect(error.message).to.include('5 images');
      }
    });

    it('should include correct image count in error message', () => {
      const req = {
        params: { id: '3' }  // Otter label used by 3 images
      } as any;
      
      try {
        controller.deleteLabel(req);
        expect.fail('Should have thrown HttpError');
      } catch (error: any) {
        expect(error).to.be.instanceOf(HttpError);
        // Verify error message mentions 3 images
        expect(error.message).to.include('3 images');
      }
    });

    it('should throw error when imageCount equals 1', () => {
      // Modify mock data to set imageCount to 1
      (mockService as any).imageCounts[2] = 1;
      
      const req = {
        params: { id: '2' }
      } as any;
      
      try {
        controller.deleteLabel(req);
        expect.fail('Should have thrown HttpError');
      } catch (error: any) {
        expect(error).to.be.instanceOf(HttpError);
        expect(error.message).to.include('1 images');
      }
    });
  });

  describe('Integration Tests', () => {
    it('should return fewer labels after deletion', () => {
      // Get initial label count
      const beforeDelete = controller.getLabels({} as any);
      const originalCount = beforeDelete.labels.length;
      
      // Delete a label that is not used by any image
      const deleteReq = {
        params: { id: '2' }
      } as any;
      controller.deleteLabel(deleteReq);
      
      // Get labels again after deletion
      const afterDelete = controller.getLabels({} as any);
      
      // Verify label count decreased by 1
      expect(afterDelete.labels).to.have.length(originalCount - 1);
    });
  });
});

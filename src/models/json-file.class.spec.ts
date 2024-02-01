import { JsonFile } from './json-file.class';

describe('JsonFile', () => {
    describe('Instance', () => {
        it('should be created', async () => {
            const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));

            expect(file).toBeInstanceOf(JsonFile);
        });
    });

    describe('getPath', () => {
        it('should return correct path', async () => {
            const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
            const path = file.getPath();

            expect(path).toBe('test.json');
        });
    });

    describe('getFilename', () => {
        it('should return correct filename', async () => {
            const file = new JsonFile('test.name.json', { name: 'Tommy' }, new Date('2023-11-10'));
            const path = file.getFilename();

            expect(path).toBe('test.name');
        });
    });

    describe('setFilename', () => {
        it('should change filename', async () => {
            const file = new JsonFile('test.name.json', { name: 'Tommy' }, new Date('2023-11-13'));
            const filename = file.getFilename();
            file.setFilename('test.name2', 'json');
            const updated = file.getFilename();

            expect(filename).toBe('test.name');
            expect(updated).toBe('test.name2');
        });
    });

    describe('getExtension', () => {
        it('should return correct extension', async () => {
            const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
            const extension = file.getExtension();

            expect(extension).toBe('json');
        });
    });

    describe('getContent', () => {
        it('should return correct file content', async () => {
            const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
            const content = file.getContent();

            expect(content).toStrictEqual({ name: 'Tommy' });
        });
    });

    describe('getModifiedDate', () => {
        it('should return correct date', async () => {
            const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
            const date = file.getModifiedDate();

            expect(date.toISOString()).toBe('2023-11-10T00:00:00.000Z');
        });
    });
});

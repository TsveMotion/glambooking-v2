const token = 'eyJpbnZpdGF0aW9uSWQiOiJjbWg4dTJnZDMwMDAxMXIzY3U5MWsyNTM1IiwiZW1haWwiOiJ0c3ZldGFub3Zjb25maWRlbnRpYWxAZ21haWwuY29tIiwiYnVzaW5lc3NJZCI6ImNtaDhyeGVqbDAwMDIzeG15cG00d25iOHkifQ==';

try {
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  console.log('Decoded invitation token:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.error('Error decoding token:', error.message);
}
